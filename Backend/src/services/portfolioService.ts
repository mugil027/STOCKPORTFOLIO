import { portfolioHoldings } from '../data/holdings';
import { mockMarketData } from '../data/mockData';
import { fetchCMPBatch, fetchFundamentalsBatch, YahooFundamentals } from './yahooFinanceService';
import { fetchGoogleFinanceBatch } from './googleFinanceService';
import {
  EnrichedStock,
  SectorSummary,
  PortfolioResponse,
  MarketData,
} from '../types/portfolio';

/**
 * Main service that orchestrates data fetching and portfolio computation.
 *
 * 3-Tier Fallback Flow:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  CMP:    Yahoo Finance → Mock                                │
 * │  PE/EPS: Google Finance → Yahoo quoteSummary → Mock          │
 * └──────────────────────────────────────────────────────────────┘
 *
 * After merging data from all tiers:
 *  - Compute derived fields (investment, present value, gain/loss, etc.)
 *  - Group by sector with sector-level summaries
 *  - Return the full enriched portfolio response
 */
export async function getEnrichedPortfolio(): Promise<PortfolioResponse> {
  const exchangeCodes = portfolioHoldings.map((h) => h.exchangeCode);

  // ═══════════════════════════════════════════════════════════
  // TIER 1: Yahoo Finance (CMP) + Google Finance (P/E, EPS)
  // ═══════════════════════════════════════════════════════════
  console.log('\n═══ TIER 1: Fetching from Yahoo (CMP) + Google (PE/EPS) ═══');
  const [cmpMap, googleMap] = await Promise.all([
    fetchCMPBatch(exchangeCodes),
    fetchGoogleFinanceBatch(exchangeCodes),
  ]);

  // Identify stocks where Google Finance didn't return PE or EPS
  const needYahooFundamentals = exchangeCodes.filter((code) => {
    const gData = googleMap.get(code);
    return !gData || gData.peRatio === null || gData.latestEarnings === null;
  });

  // ═══════════════════════════════════════════════════════════
  // TIER 2: Yahoo quoteSummary (PE/EPS only, for Google misses)
  // ═══════════════════════════════════════════════════════════
  let yahooFundMap = new Map<string, YahooFundamentals>();

  if (needYahooFundamentals.length > 0) {
    console.log(`\n═══ TIER 2: Fetching PE/EPS for ${needYahooFundamentals.length} stocks from Yahoo quoteSummary ═══`);
    yahooFundMap = await fetchFundamentalsBatch(needYahooFundamentals);
  } else {
    console.log('\n═══ TIER 2: Skipped — all PE/EPS fetched from Google ═══');
  }

  // ═══════════════════════════════════════════════════════════
  // TIER 3: Merge all data with mock fallback
  // ═══════════════════════════════════════════════════════════
  console.log('\n═══ TIER 3: Merging data (mock fallback for remaining) ═══');

  const marketDataMap = new Map<string, MarketData>();
  let liveCount = 0;
  let mockCount = 0;
  let peFromGoogle = 0, peFromYahoo = 0, peFromMock = 0;
  let epsFromGoogle = 0, epsFromYahoo = 0, epsFromMock = 0;

  for (const holding of portfolioHoldings) {
    const code = holding.exchangeCode;

    // Get data from each tier
    const yahooCMP = cmpMap.get(code) ?? null;
    const googleData = googleMap.get(code) ?? { peRatio: null, latestEarnings: null };
    const yahooFund = yahooFundMap.get(code) ?? { peRatio: null, eps: null };
    const mock = mockMarketData[code];

    // Resolve CMP: Yahoo → Mock
    const cmp = yahooCMP ?? mock?.cmp ?? null;
    let cmpSource: 'yahoo' | 'mock' | null = null;
    if (yahooCMP !== null) cmpSource = 'yahoo';
    else if (mock?.cmp != null) cmpSource = 'mock';

    // Resolve P/E: Google → Yahoo quoteSummary → Mock
    const peRatio = googleData.peRatio ?? yahooFund.peRatio ?? mock?.peRatio ?? null;
    let peSource: 'google' | 'yahoo' | 'mock' | null = null;
    if (googleData.peRatio !== null) { peSource = 'google'; peFromGoogle++; }
    else if (yahooFund.peRatio !== null) { peSource = 'yahoo'; peFromYahoo++; }
    else if (mock?.peRatio != null) { peSource = 'mock'; peFromMock++; }

    // Resolve EPS: Google → Yahoo quoteSummary → Mock
    const latestEarnings = googleData.latestEarnings ?? yahooFund.eps ?? mock?.latestEarnings ?? null;
    let epsSource: 'google' | 'yahoo' | 'mock' | null = null;
    if (googleData.latestEarnings !== null) { epsSource = 'google'; epsFromGoogle++; }
    else if (yahooFund.eps !== null) { epsSource = 'yahoo'; epsFromYahoo++; }
    else if (mock?.latestEarnings != null) { epsSource = 'mock'; epsFromMock++; }

    // Determine overall source for tracking
    const source: 'live' | 'mock' = yahooCMP !== null ? 'live' : 'mock';
    if (yahooCMP !== null) liveCount++;
    else mockCount++;

    marketDataMap.set(code, {
      cmp,
      peRatio,
      latestEarnings,
      lastUpdated: new Date().toISOString(),
      source,
      cmpSource,
      peSource,
      epsSource,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // COMPUTE: Derived fields
  // ═══════════════════════════════════════════════════════════
  const totalInvestment = portfolioHoldings.reduce(
    (sum, h) => sum + h.purchasePrice * h.quantity,
    0
  );

  const enrichedStocks: EnrichedStock[] = portfolioHoldings.map((holding) => {
    const market = marketDataMap.get(holding.exchangeCode)!;
    const investment = holding.purchasePrice * holding.quantity;
    const presentValue =
      market.cmp !== null ? market.cmp * holding.quantity : null;
    const gainLoss =
      presentValue !== null ? presentValue - investment : null;
    const gainLossPercent =
      gainLoss !== null ? (gainLoss / investment) * 100 : null;
    const portfolioPercent = (investment / totalInvestment) * 100;

    return {
      ...holding,
      ...market,
      investment,
      presentValue,
      gainLoss,
      gainLossPercent,
      portfolioPercent,
    };
  });

  // ═══════════════════════════════════════════════════════════
  // GROUP: By sector
  // ═══════════════════════════════════════════════════════════
  const sectorMap = new Map<string, EnrichedStock[]>();
  for (const stock of enrichedStocks) {
    const existing = sectorMap.get(stock.sector) || [];
    existing.push(stock);
    sectorMap.set(stock.sector, existing);
  }

  const sectorOrder = [
    'Financial Sector',
    'Tech Sector',
    'Consumer',
    'Power',
    'Pipe Sector',
    'Others',
  ];

  const sectors: SectorSummary[] = sectorOrder
    .filter((s) => sectorMap.has(s))
    .map((sectorName) => {
      const stocks = sectorMap.get(sectorName)!;

      const totalSectorInvestment = stocks.reduce(
        (sum, s) => sum + s.investment,
        0
      );
      const totalSectorPresentValue = stocks.reduce(
        (sum, s) => sum + (s.presentValue ?? 0),
        0
      );
      const totalSectorGainLoss =
        totalSectorPresentValue - totalSectorInvestment;
      const totalSectorGainLossPercent =
        (totalSectorGainLoss / totalSectorInvestment) * 100;

      return {
        sector: sectorName,
        totalInvestment: totalSectorInvestment,
        totalPresentValue: totalSectorPresentValue,
        totalGainLoss: totalSectorGainLoss,
        totalGainLossPercent: totalSectorGainLossPercent,
        stocks,
      };
    });

  // ═══════════════════════════════════════════════════════════
  // TOTALS: Portfolio-level
  // ═══════════════════════════════════════════════════════════
  const totalPresentValue = enrichedStocks.reduce(
    (sum, s) => sum + (s.presentValue ?? 0),
    0
  );
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercent = (totalGainLoss / totalInvestment) * 100;

  let dataSource: 'live' | 'mock' | 'mixed' = 'mixed';
  if (liveCount === portfolioHoldings.length) dataSource = 'live';
  else if (mockCount === portfolioHoldings.length) dataSource = 'mock';

  console.log(
    `\n═══ Portfolio ready ═══` +
    `\n  CMP   → Yahoo: ${liveCount}  |  Mock: ${mockCount}` +
    `\n  P/E   → Google: ${peFromGoogle}  |  Yahoo fallback: ${peFromYahoo}  |  Mock: ${peFromMock}` +
    `\n  EPS   → Google: ${epsFromGoogle}  |  Yahoo fallback: ${epsFromYahoo}  |  Mock: ${epsFromMock}` +
    `\n═══════════════════════\n`
  );

  return {
    sectors,
    totals: {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercent,
    },
    lastUpdated: new Date().toISOString(),
    dataSource,
  };
}
