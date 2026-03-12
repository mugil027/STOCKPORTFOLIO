// ─── Static Data ───
export interface StockHolding {
  id: number;
  name: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
  exchangeCode: string;
}

// ─── Live Market Data ───
export interface MarketData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  lastUpdated: string;
  source: 'live' | 'mock';
  cmpSource: 'yahoo' | 'finnhub' | 'mock' | null;
  peSource: 'google' | 'yahoo' | 'finnhub' | 'mock' | null;
  epsSource: 'google' | 'yahoo' | 'finnhub' | 'mock' | null;
}

// ─── Computed Fields ───
export interface ComputedFields {
  investment: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  portfolioPercent: number;
}

// ─── Full Enriched Stock ───
export interface EnrichedStock extends StockHolding, MarketData, ComputedFields {}

// ─── Sector Summary ───
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  stocks: EnrichedStock[];
}

// ─── Full Portfolio Response ───
export interface PortfolioResponse {
  sectors: SectorSummary[];
  totals: {
    totalInvestment: number;
    totalPresentValue: number | null;
    totalGainLoss: number | null;
    totalGainLossPercent: number | null;
  };
  lastUpdated: string;
  dataSource: 'live' | 'mock' | 'mixed';
}
