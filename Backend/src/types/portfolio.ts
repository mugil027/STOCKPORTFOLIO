// ─── Static Data (from Excel) ───
export interface StockHolding {
  id: number;
  name: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
  exchangeCode: string; // NSE symbol or BSE code
}

// ─── Live Market Data (fetched from APIs) ───
export interface MarketData {
  cmp: number | null;            // Current Market Price (Yahoo Finance)
  peRatio: number | null;        // P/E Ratio (Google Finance)
  latestEarnings: number | null; // EPS (Google Finance)
  lastUpdated: string;           // ISO timestamp
  source: 'live' | 'mock';      // Overall source (for backward compat)
  cmpSource: 'yahoo' | 'finnhub' | 'mock' | null;                     // Where CMP came from
  peSource: 'google' | 'yahoo' | 'finnhub' | 'mock' | null;           // Where P/E came from
  epsSource: 'google' | 'yahoo' | 'finnhub' | 'mock' | null;          // Where EPS came from
}

// ─── Computed Fields ───
export interface ComputedFields {
  investment: number;              // purchasePrice × quantity
  presentValue: number | null;     // cmp × quantity
  gainLoss: number | null;         // presentValue - investment
  gainLossPercent: number | null;  // (gainLoss / investment) * 100
  portfolioPercent: number;        // weight in total portfolio
}

// ─── Full Enriched Stock (sent to frontend) ───
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

// ─── API Error Response ───
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}
