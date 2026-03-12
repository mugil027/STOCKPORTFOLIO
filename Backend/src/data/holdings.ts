import { StockHolding } from '../types/portfolio';

/**
 * Static portfolio holdings data extracted from the Excel sheet.
 * This includes purchase price, quantity, sector, and exchange codes.
 * CMP, P/E, and earnings are fetched live from APIs.
 */
export const portfolioHoldings: StockHolding[] = [
  // ─── Financial Sector ───
  { id: 1, name: 'HDFC Bank', purchasePrice: 1490, quantity: 50, sector: 'Financial Sector', exchangeCode: 'HDFCBANK' },
  { id: 2, name: 'Bajaj Finance', purchasePrice: 6466, quantity: 15, sector: 'Financial Sector', exchangeCode: 'BAJFINANCE' },
  { id: 3, name: 'ICICI Bank', purchasePrice: 780, quantity: 84, sector: 'Financial Sector', exchangeCode: '532174' },
  { id: 4, name: 'Bajaj Housing', purchasePrice: 130, quantity: 504, sector: 'Financial Sector', exchangeCode: '544252' },
  { id: 5, name: 'Savani Financials', purchasePrice: 24, quantity: 1080, sector: 'Financial Sector', exchangeCode: '511577' },

  // ─── Tech Sector ───
  { id: 6, name: 'Affle India', purchasePrice: 1151, quantity: 50, sector: 'Tech Sector', exchangeCode: 'AFFLE' },
  { id: 7, name: 'LTI Mindtree', purchasePrice: 4775, quantity: 16, sector: 'Tech Sector', exchangeCode: 'LTIM' },
  { id: 8, name: 'KPIT Tech', purchasePrice: 672, quantity: 61, sector: 'Tech Sector', exchangeCode: '542651' },
  { id: 9, name: 'Tata Tech', purchasePrice: 1072, quantity: 63, sector: 'Tech Sector', exchangeCode: '544028' },
  { id: 10, name: 'BLS E-Services', purchasePrice: 232, quantity: 191, sector: 'Tech Sector', exchangeCode: '544107' },
  { id: 11, name: 'Tanla', purchasePrice: 1134, quantity: 45, sector: 'Tech Sector', exchangeCode: '532790' },

  // ─── Consumer ───
  { id: 12, name: 'Dmart', purchasePrice: 3777, quantity: 27, sector: 'Consumer', exchangeCode: 'DMART' },
  { id: 13, name: 'Tata Consumer', purchasePrice: 845, quantity: 90, sector: 'Consumer', exchangeCode: '532540' },
  { id: 14, name: 'Pidilite', purchasePrice: 2376, quantity: 36, sector: 'Consumer', exchangeCode: '500331' },

  // ─── Power ───
  { id: 15, name: 'Tata Power', purchasePrice: 224, quantity: 225, sector: 'Power', exchangeCode: '500400' },
  { id: 16, name: 'KPI Green', purchasePrice: 875, quantity: 50, sector: 'Power', exchangeCode: '542323' },
  { id: 17, name: 'Suzlon', purchasePrice: 44, quantity: 450, sector: 'Power', exchangeCode: '532667' },
  { id: 18, name: 'Gensol', purchasePrice: 998, quantity: 45, sector: 'Power', exchangeCode: '542851' },

  // ─── Pipe Sector ───
  { id: 19, name: 'Hariom Pipes', purchasePrice: 580, quantity: 60, sector: 'Pipe Sector', exchangeCode: '543517' },
  { id: 20, name: 'Astral', purchasePrice: 1517, quantity: 56, sector: 'Pipe Sector', exchangeCode: 'ASTRAL' },
  { id: 21, name: 'Polycab', purchasePrice: 2818, quantity: 28, sector: 'Pipe Sector', exchangeCode: '542652' },

  // ─── Others ───
  { id: 22, name: 'Clean Science', purchasePrice: 1610, quantity: 32, sector: 'Others', exchangeCode: '543318' },
  { id: 23, name: 'Deepak Nitrite', purchasePrice: 2248, quantity: 27, sector: 'Others', exchangeCode: '506401' },
  { id: 24, name: 'Fine Organic', purchasePrice: 4284, quantity: 16, sector: 'Others', exchangeCode: '541557' },
  { id: 25, name: 'Gravita', purchasePrice: 2037, quantity: 8, sector: 'Others', exchangeCode: '533282' },
  { id: 26, name: 'SBI Life', purchasePrice: 1197, quantity: 49, sector: 'Others', exchangeCode: '540719' },
];

/**
 * NSE Symbol mapping for stocks that use BSE numeric codes in the Excel.
 * Yahoo Finance works MUCH more reliably with NSE .NS symbols
 * than BSE .BO numeric codes.
 */
const nseSymbolMap: Record<string, string> = {
  '532174': 'ICICIBANK',
  '544252': 'BAJAJHFL',
  '511577': 'SAVANI',
  '542651': 'KPITTECH',
  '544028': 'TATATECH',
  '544107': 'BLSE',
  '532790': 'TANLA',
  '532540': 'TATACONSUM',
  '500331': 'PIDILITIND',
  '500400': 'TATAPOWER',
  '542323': 'KPIGREEN',
  '532667': 'SUZLON',
  '542851': 'GENSOL',
  '543517': 'HARIOMPIPE',
  '542652': 'POLYCAB',
  '543318': 'CLEAN',
  '506401': 'DEEPAKNTR',
  '541557': 'FINEORG',
  '533282': 'GRAVITA',
  '540719': 'SBILIFE',
};

/**
 * Get the Yahoo Finance ticker symbol for a stock.
 * Prefers NSE (.NS) over BSE (.BO) for reliability.
 */
export function getYahooSymbol(exchangeCode: string): string {
  const nseSymbol = nseSymbolMap[exchangeCode];
  if (nseSymbol) return `${nseSymbol}.NS`;
  if (/^\d+$/.test(exchangeCode)) return `${exchangeCode}.BO`;
  return `${exchangeCode}.NS`;
}

/**
 * Get the Google Finance ticker for scraping.
 * Uses NSE:SYMBOL or BOM:CODE format.
 */
export function getGoogleFinanceSymbol(exchangeCode: string): string {
  const nseSymbol = nseSymbolMap[exchangeCode];
  if (nseSymbol) return `NSE:${nseSymbol}`;
  if (/^\d+$/.test(exchangeCode)) return `BOM:${exchangeCode}`;
  return `NSE:${exchangeCode}`;
}
