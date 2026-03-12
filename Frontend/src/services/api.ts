import axios from 'axios';
import { PortfolioResponse } from '@/types/portfolio';

// IMPORTANT: This must match the backend port (4000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout (backend may take time fetching live data)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch the full enriched portfolio with live market data.
 */
export async function fetchPortfolio(): Promise<PortfolioResponse> {
  const response = await apiClient.get<PortfolioResponse>('/portfolio');
  return response.data;
}

/**
 * Force refresh - clears cache and re-fetches all data.
 */
export async function refreshPortfolio(): Promise<PortfolioResponse> {
  const response = await apiClient.post<{ message: string; portfolio: PortfolioResponse }>(
    '/refresh'
  );
  return response.data.portfolio;
}

/**
 * Fetch static holdings data (instant response, no API calls).
 */
export async function fetchHoldings() {
  const response = await apiClient.get('/holdings');
  return response.data;
}

/**
 * Health check
 */
export async function checkHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}
