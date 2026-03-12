import axios from 'axios';
import { cacheService } from './cacheService';
import { getFinnhubSymbol } from '../data/holdings';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubData {
  cmp: number | null;
  peRatio: number | null;
  eps: number | null;
}

/**
 * Fetches CMP + P/E + EPS from Finnhub for a single stock.
 * Makes two parallel requests: /quote (CMP) and /stock/metric (PE/EPS).
 */
export async function fetchFinnhubData(exchangeCode: string): Promise<FinnhubData> {
  if (!FINNHUB_KEY) return { cmp: null, peRatio: null, eps: null };

  const cacheKey = `finnhub:${exchangeCode}`;
  const cached = cacheService.get<FinnhubData>(cacheKey);
  if (cached !== undefined) {
    console.log(`[Finnhub] Cache HIT for ${exchangeCode}`);
    return cached;
  }

  const symbol = getFinnhubSymbol(exchangeCode);
  console.log(`[Finnhub] Fetching ${symbol}...`);

  const [quoteRes, metricsRes] = await Promise.allSettled([
    axios.get(`${BASE_URL}/quote`, {
      params: { symbol, token: FINNHUB_KEY },
      timeout: 10000,
    }),
    axios.get(`${BASE_URL}/stock/metric`, {
      params: { symbol, metric: 'all', token: FINNHUB_KEY },
      timeout: 10000,
    }),
  ]);

  let cmp: number | null = null;
  if (quoteRes.status === 'fulfilled') {
    const q = quoteRes.value.data;
    // c = current price, pc = previous close (fallback when market is closed)
    cmp = q.c > 0 ? q.c : (q.pc > 0 ? q.pc : null);
  }

  let peRatio: number | null = null;
  let eps: number | null = null;
  if (metricsRes.status === 'fulfilled') {
    const m = metricsRes.value.data?.metric;
    if (m) {
      peRatio = m.peBasicExclExtraTTM ?? m.peTTM ?? null;
      eps = m.epsBasicExclExtraAnnual ?? m.epsTTM ?? null;
    }
  }

  const data: FinnhubData = { cmp, peRatio, eps };
  cacheService.set(cacheKey, data);

  const cmpStr = cmp !== null ? `✅ ₹${cmp}` : '❌ null';
  const peStr  = peRatio !== null ? `✅ ${peRatio.toFixed(2)}` : '❌ null';
  const epsStr = eps !== null ? `✅ ${eps}` : '❌ null';
  console.log(`[Finnhub] ${exchangeCode}: CMP=${cmpStr}, P/E=${peStr}, EPS=${epsStr}`);

  return data;
}

/**
 * Batch-fetches Finnhub data for a list of exchange codes.
 * Skips entirely if FINNHUB_API_KEY is not set.
 */
export async function fetchFinnhubBatch(
  exchangeCodes: string[]
): Promise<Map<string, FinnhubData>> {
  const results = new Map<string, FinnhubData>();

  if (!FINNHUB_KEY) {
    console.log('[Finnhub] Skipped — FINNHUB_API_KEY not configured');
    exchangeCodes.forEach((code) => results.set(code, { cmp: null, peRatio: null, eps: null }));
    return results;
  }

  const BATCH_SIZE = 5;
  const DELAY_MS = 300;

  for (let i = 0; i < exchangeCodes.length; i += BATCH_SIZE) {
    const batch = exchangeCodes.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (code) => ({ code, data: await fetchFinnhubData(code) }))
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.set(result.value.code, result.value.data);
      } else {
        results.set(batch[j], { cmp: null, peRatio: null, eps: null });
      }
    }

    if (i + BATCH_SIZE < exchangeCodes.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return results;
}
