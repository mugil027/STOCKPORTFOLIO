import axios from 'axios';
import * as cheerio from 'cheerio';
import { cacheService } from './cacheService';
import { getGoogleFinanceSymbol } from '../data/holdings';

interface GoogleFinanceData {
  peRatio: number | null;
  latestEarnings: number | null; // EPS
}

/**
 * Scrapes P/E Ratio and EPS from Google Finance for a given stock.
 * Uses a multi-layer parsing approach:
 *   1. CSS selector-based extraction (primary)
 *   2. Regex-based extraction on full page text (fallback)
 *
 * Google Finance URL: https://www.google.com/finance/quote/NSE:SYMBOL
 */
export async function fetchGoogleFinanceData(
  exchangeCode: string
): Promise<GoogleFinanceData> {
  const cacheKey = `gf:${exchangeCode}`;

  const cached = cacheService.get<GoogleFinanceData>(cacheKey);
  if (cached !== undefined) {
    console.log(`[Google] Cache HIT for ${exchangeCode}`);
    return cached;
  }

  const symbol = getGoogleFinanceSymbol(exchangeCode);
  const url = `https://www.google.com/finance/quote/${symbol}`;
  console.log(`[Google] Scraping ${url}...`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      params: { hl: 'en' },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    let peRatio: number | null = null;
    let latestEarnings: number | null = null;

    // ─── Layer 1: CSS selector-based parsing ───
    // Google Finance "About" panel uses .gyFHrc containers
    // with .mfs7Fc for labels and .P6K39c for values
    $('.gyFHrc').each((_, el) => {
      const label = $(el).find('.mfs7Fc').text().trim().toLowerCase();
      const value = $(el).find('.P6K39c').text().trim();

      if (label.includes('p/e') && peRatio === null) {
        const parsed = parseFloat(value.replace(/,/g, ''));
        if (!isNaN(parsed) && parsed > 0) peRatio = parsed;
      }

      if ((label.includes('eps') || label.includes('earnings per share')) && latestEarnings === null) {
        const cleaned = value.replace(/[₹$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) latestEarnings = parsed;
      }
    });

    // ─── Layer 2: Try alternative selectors ───
    // Google sometimes uses different class names
    if (peRatio === null || latestEarnings === null) {
      $('[data-attrid]').each((_, el) => {
        const label = $(el).text().toLowerCase();
        const allText = $(el).text();

        if (label.includes('p/e ratio') && peRatio === null) {
          const match = allText.match(/(\d+\.?\d*)/);
          if (match) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed) && parsed > 0 && parsed < 1000) peRatio = parsed;
          }
        }

        if (label.includes('eps') && latestEarnings === null) {
          const match = allText.match(/₹?\s*(-?\d+\.?\d*)/);
          if (match) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed)) latestEarnings = parsed;
          }
        }
      });
    }

    // ─── Layer 3: Regex on full page text (last resort) ───
    if (peRatio === null || latestEarnings === null) {
      const bodyText = $('body').text();

      if (peRatio === null) {
        // Match "P/E ratio" followed by a number
        const pePatterns = [
          /P\/E\s*ratio\s*[:\s]*(\d+\.?\d*)/i,
          /PE\s*ratio\s*[:\s]*(\d+\.?\d*)/i,
          /P\/E\s*\(TTM\)\s*[:\s]*(\d+\.?\d*)/i,
        ];
        for (const pattern of pePatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed) && parsed > 0 && parsed < 1000) {
              peRatio = parsed;
              break;
            }
          }
        }
      }

      if (latestEarnings === null) {
        // Match "EPS" followed by a number (with optional ₹ sign)
        const epsPatterns = [
          /EPS\s*\(TTM\)\s*[:\s]*₹?\s*(-?\d+\.?\d*)/i,
          /EPS\s*[:\s]*₹?\s*(-?\d+\.?\d*)/i,
          /Earnings\s*per\s*share\s*[:\s]*₹?\s*(-?\d+\.?\d*)/i,
        ];
        for (const pattern of epsPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed)) {
              latestEarnings = parsed;
              break;
            }
          }
        }
      }
    }

    const data: GoogleFinanceData = { peRatio, latestEarnings };
    cacheService.set(cacheKey, data);

    const peStatus = peRatio !== null ? `✅ ${peRatio}` : '❌ null';
    const epsStatus = latestEarnings !== null ? `✅ ${latestEarnings}` : '❌ null';
    console.log(`[Google] ${exchangeCode}: P/E=${peStatus}, EPS=${epsStatus}`);

    return data;
  } catch (error: any) {
    const status = error.response?.status;
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Google] ❌ ${exchangeCode} (HTTP ${status || '?'}): ${errMsg}`);
    return { peRatio: null, latestEarnings: null };
  }
}

/**
 * Helper to pause between requests.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch fetch Google Finance data with staggered requests.
 * Sends requests in small batches of 3 with 500ms delay to
 * avoid Google blocking us.
 */
export async function fetchGoogleFinanceBatch(
  exchangeCodes: string[]
): Promise<Map<string, GoogleFinanceData>> {
  const results = new Map<string, GoogleFinanceData>();
  const BATCH_SIZE = 3;
  const DELAY_MS = 500;

  for (let i = 0; i < exchangeCodes.length; i += BATCH_SIZE) {
    const batch = exchangeCodes.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (code) => {
        const data = await fetchGoogleFinanceData(code);
        return { code, data };
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.set(result.value.code, result.value.data);
      } else {
        results.set(batch[j], { peRatio: null, latestEarnings: null });
      }
    }

    if (i + BATCH_SIZE < exchangeCodes.length) {
      await delay(DELAY_MS);
    }
  }

  return results;
}
