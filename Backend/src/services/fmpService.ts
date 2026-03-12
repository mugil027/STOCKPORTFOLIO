import axios from 'axios';
import { cacheService } from './cacheService';
import { getYahooSymbol } from '../data/holdings';

/**
 * FMP (Financial Modeling Prep) API Service
 *
 * Acts as the second fallback layer:
 *   Yahoo/Google → FMP → Mock Data
 *
 * KEY OPTIMIZATION: FMP supports comma-separated symbols in a single call.
 * URL format: /api/v3/quote/HDFCBANK.NS,ICICIBANK.NS,...?apikey=KEY
 * This means ALL 26 stocks in 1 API call instead of 26 separate calls.
 *
 * Free tier: 250 requests/day. With batch = 1 call per refresh.
 * At 20-min intervals = 72 calls/day max. Well within limits.
 *
 * API Docs: https://financialmodelingprep.com/developer/docs
 */

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

export interface FMPStockData {
  cmp: number | null;
  peRatio: number | null;
  eps: number | null;
}

/**
 * Batch fetch FMP data for ALL stocks in a SINGLE API call.
 * FMP's /quote endpoint accepts comma-separated symbols.
 * This uses just 1 API call regardless of how many stocks we need.
 *
 * @param exchangeCodes - Array of exchange codes that need FMP data
 * @returns Map of exchangeCode -> FMPStockData
 */
export async function fetchFMPBatch(
  exchangeCodes: string[]
): Promise<Map<string, FMPStockData>> {
  const results = new Map<string, FMPStockData>();

  // Initialize all with null
  for (const code of exchangeCodes) {
    results.set(code, { cmp: null, peRatio: null, eps: null });
  }

  // Read env var here (inside function) so dotenv.config() in index.ts has run first
  const FMP_API_KEY = process.env.FMP_API_KEY || '';

  if (!FMP_API_KEY || FMP_API_KEY === 'YOUR_FMP_API_KEY_HERE') {
    console.warn('[FMP] No API key configured — skipping FMP fallback');
    return results;
  }

  // Build symbol mapping: exchangeCode -> Yahoo-style symbol
  const symbolMap = new Map<string, string>(); // symbol -> exchangeCode
  const symbols: string[] = [];

  for (const code of exchangeCodes) {
    const symbol = getYahooSymbol(code);
    symbols.push(symbol);
    symbolMap.set(symbol.toUpperCase(), code);
  }

  // Join all symbols with commas for batch request
  const symbolsParam = symbols.join(',');
  const url = `${FMP_BASE_URL}/quote/${symbolsParam}`;

  console.log(`[FMP] Batch fetching ${exchangeCodes.length} stocks in 1 API call...`);

  try {
    const response = await axios.get(url, {
      params: { apikey: FMP_API_KEY },
      timeout: 15000,
    });

    const data = response.data;

    if (!Array.isArray(data)) {
      console.warn('[FMP] Unexpected response format (not an array)');
      return results;
    }

    let successCount = 0;

    for (const quote of data) {
      // FMP returns the symbol field — match it back to exchangeCode
      const fmpSymbol = (quote.symbol || '').toUpperCase();
      const exchangeCode = symbolMap.get(fmpSymbol);

      if (!exchangeCode) {
        // Try matching without .NS/.BO suffix
        const baseSymbol = fmpSymbol.replace(/\.(NS|BO)$/i, '');
        let matched = false;
        for (const [sym, code] of symbolMap.entries()) {
          if (sym.replace(/\.(NS|BO)$/i, '') === baseSymbol) {
            const result: FMPStockData = {
              cmp: typeof quote.price === 'number' ? quote.price : null,
              peRatio: typeof quote.pe === 'number' && quote.pe > 0 ? quote.pe : null,
              eps: typeof quote.eps === 'number' ? quote.eps : null,
            };
            results.set(code, result);
            if (result.cmp !== null) successCount++;
            matched = true;
            break;
          }
        }
        if (!matched) continue;
      } else {
        const result: FMPStockData = {
          cmp: typeof quote.price === 'number' ? quote.price : null,
          peRatio: typeof quote.pe === 'number' && quote.pe > 0 ? quote.pe : null,
          eps: typeof quote.eps === 'number' ? quote.eps : null,
        };
        results.set(exchangeCode, result);
        if (result.cmp !== null) successCount++;
      }
    }

    console.log(`[FMP] ✅ Got data for ${successCount}/${exchangeCodes.length} stocks (1 API call used)`);

    // Cache the entire batch result with 5-minute TTL
    for (const [code, data] of results.entries()) {
      if (data.cmp !== null || data.peRatio !== null || data.eps !== null) {
        cacheService.set(`fmp:${code}`, data, 300);
      }
    }

    return results;
  } catch (error: any) {
    const status = error.response?.status;
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[FMP] ❌ Batch request failed (HTTP ${status || '?'}): ${errMsg}`);
    return results;
  }
}
