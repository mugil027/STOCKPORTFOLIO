import axios from 'axios';
import { cacheService } from './cacheService';
import { getYahooSymbol } from '../data/holdings';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/**
 * Fetches CMP from Yahoo Finance's internal v8 chart API.
 * Uses NSE symbols (.NS) for Indian stocks which are far more reliable
 * than BSE numeric codes (.BO).
 */
export async function fetchCMP(exchangeCode: string): Promise<number | null> {
  const cacheKey = `cmp:${exchangeCode}`;

  const cached = cacheService.get<number>(cacheKey);
  if (cached !== undefined) {
    console.log(`[Yahoo] Cache HIT for ${exchangeCode}: ${cached}`);
    return cached;
  }

  const symbol = getYahooSymbol(exchangeCode);
  console.log(`[Yahoo] Fetching CMP for ${symbol}...`);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;

    const response = await axios.get(url, {
      params: { interval: '1d', range: '1d' },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    const result = response.data?.chart?.result?.[0];
    if (!result) {
      console.warn(`[Yahoo] No chart result for ${symbol}`);
      return null;
    }

    const price = result.meta?.regularMarketPrice ?? result.meta?.previousClose ?? null;

    if (price !== null && typeof price === 'number') {
      cacheService.set(cacheKey, price);
      console.log(`[Yahoo] ✅ ${exchangeCode} (${symbol}): ₹${price}`);
      return price;
    }

    console.warn(`[Yahoo] No price in response for ${symbol}`);
    return null;
  } catch (error: any) {
    const status = error.response?.status;
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Yahoo] ❌ ${symbol} (HTTP ${status || '?'}): ${errMsg}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PE / EPS  —  Yahoo Finance quoteSummary v10 API
//
// Yahoo Finance now requires a crumb token for the quoteSummary endpoint.
// The crumb handshake is a one-time operation per server session:
//   Step 1: GET https://fc.yahoo.com  →  captures session cookie
//   Step 2: GET /v1/test/getcrumb (with cookie)  →  returns crumb string
//   Step 3: Include cookie + crumb in quoteSummary requests
//
// The crumb is cached in memory for the lifetime of the process.
// ─────────────────────────────────────────────────────────────────────────────

interface YahooCrumb {
  crumb: string;
  cookie: string;
}

let _yahooCrumb: YahooCrumb | null = null;

/**
 * Fetches (and caches) a Yahoo Finance crumb token.
 * Required for the v10 quoteSummary endpoint since Yahoo added auth.
 */
async function getYahooCrumb(): Promise<YahooCrumb | null> {
  if (_yahooCrumb) return _yahooCrumb;

  try {
    // Step 1: Hit fc.yahoo.com to get a session cookie
    const cookieRes = await axios.get('https://fc.yahoo.com', {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 8000,
      validateStatus: () => true, // accept any HTTP status
    });

    const setCookieHeader = cookieRes.headers['set-cookie'];
    if (!setCookieHeader || setCookieHeader.length === 0) {
      console.warn('[Yahoo Crumb] No cookie returned from fc.yahoo.com');
      return null;
    }

    // Join all cookie parts into a single header string
    const cookie = setCookieHeader
      .map((c: string) => c.split(';')[0])
      .join('; ');

    // Step 2: Use that cookie to get the crumb value
    const crumbRes = await axios.get(
      'https://query1.finance.yahoo.com/v1/test/getcrumb',
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Cookie': cookie,
        },
        timeout: 8000,
      }
    );

    const crumb = crumbRes.data;
    if (typeof crumb !== 'string' || crumb.trim() === '') {
      console.warn('[Yahoo Crumb] Empty crumb returned');
      return null;
    }

    _yahooCrumb = { crumb, cookie };
    console.log('[Yahoo Crumb] ✅ Crumb obtained successfully');
    return _yahooCrumb;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Yahoo Crumb] ❌ Failed to get crumb: ${errMsg}`);
    return null;
  }
}

export interface YahooFundamentals {
  peRatio: number | null;
  eps: number | null;
}

export async function fetchFundamentals(
  exchangeCode: string
): Promise<YahooFundamentals> {
  const cacheKey = `yf:fund:${exchangeCode}`;

  const cached = cacheService.get<YahooFundamentals>(cacheKey);
  if (cached !== undefined) {
    console.log(`[Yahoo Fundamentals] Cache HIT for ${exchangeCode}`);
    return cached;
  }

  const symbol = getYahooSymbol(exchangeCode);

  // Get crumb — required for v10 quoteSummary
  const crumbData = await getYahooCrumb();
  if (!crumbData) {
    console.warn(`[Yahoo Fundamentals] Skipping ${exchangeCode} — no crumb`);
    return { peRatio: null, eps: null };
  }

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`;

  try {
    const response = await axios.get(url, {
      params: {
        modules: 'summaryDetail,defaultKeyStatistics',
        crumb: crumbData.crumb,
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Cookie': crumbData.cookie,
      },
      timeout: 10000,
    });

    const result = response.data?.quoteSummary?.result?.[0];
    if (!result) {
      console.warn(`[Yahoo Fundamentals] No quoteSummary result for ${symbol}`);
      return { peRatio: null, eps: null };
    }

    const peRaw = result.summaryDetail?.trailingPE?.raw;
    const epsRaw = result.defaultKeyStatistics?.trailingEps?.raw;

    const peRatio = typeof peRaw === 'number' && peRaw > 0 ? peRaw : null;
    const eps = typeof epsRaw === 'number' ? epsRaw : null;

    const data: YahooFundamentals = { peRatio, eps };
    cacheService.set(cacheKey, data);

    const peStatus = peRatio !== null ? `✅ ${peRatio}` : '❌ null';
    const epsStatus = eps !== null ? `✅ ${eps}` : '❌ null';
    console.log(`[Yahoo Fundamentals] ${exchangeCode}: P/E=${peStatus}, EPS=${epsStatus}`);

    return data;
  } catch (error: any) {
    const status = error.response?.status;
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Yahoo Fundamentals] ❌ ${symbol} (HTTP ${status || '?'}): ${errMsg}`);

    // If we get 401, the crumb may have expired — clear it so next call retries
    if (status === 401) {
      _yahooCrumb = null;
    }

    return { peRatio: null, eps: null };
  }
}

export async function fetchFundamentalsBatch(
  exchangeCodes: string[]
): Promise<Map<string, YahooFundamentals>> {
  const results = new Map<string, YahooFundamentals>();
  const BATCH_SIZE = 5;
  const DELAY_MS = 300;

  // Warm up crumb once before batch starts (avoids 26 parallel crumb fetches)
  await getYahooCrumb();

  for (let i = 0; i < exchangeCodes.length; i += BATCH_SIZE) {
    const batch = exchangeCodes.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (code) => {
        const data = await fetchFundamentals(code);
        return { code, data };
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.set(result.value.code, result.value.data);
      } else {
        results.set(batch[j], { peRatio: null, eps: null });
      }
    }

    if (i + BATCH_SIZE < exchangeCodes.length) {
      await delay(DELAY_MS);
    }
  }

  return results;
}

/**
 * Helper to pause between requests to avoid rate limiting.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch fetch CMP for all stocks with staggered requests.
 * Sends requests in small batches of 5 with a 300ms delay between
 * batches to avoid Yahoo's rate limiting.
 */
export async function fetchCMPBatch(
  exchangeCodes: string[]
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();
  const BATCH_SIZE = 5;
  const DELAY_MS = 300;

  for (let i = 0; i < exchangeCodes.length; i += BATCH_SIZE) {
    const batch = exchangeCodes.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (code) => {
        const cmp = await fetchCMP(code);
        return { code, cmp };
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.set(result.value.code, result.value.cmp);
      } else {
        results.set(batch[j], null);
      }
    }

    // Wait between batches (skip after last batch)
    if (i + BATCH_SIZE < exchangeCodes.length) {
      await delay(DELAY_MS);
    }
  }

  return results;
}
