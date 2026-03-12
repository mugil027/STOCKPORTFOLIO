import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioResponse } from '@/types/portfolio';
import { fetchPortfolio, refreshPortfolio } from '@/services/api';

interface UsePortfolioOptions {
  autoRefreshInterval?: number; // in milliseconds, default 15000 (15s)
}

interface UsePortfolioReturn {
  data: PortfolioResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

export function usePortfolio(
  options: UsePortfolioOptions = {}
): UsePortfolioReturn {
  const { autoRefreshInterval = 15000 } = options;

  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial fetch
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);

      const portfolio = await fetchPortfolio();
      setData(portfolio);
      setLastFetched(new Date());
      setError(null);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch portfolio data';
      setError(message);
      console.error('[usePortfolio] Fetch error:', message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Manual force refresh (clears backend cache)
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const portfolio = await refreshPortfolio();
      setData(portfolio);
      setLastFetched(new Date());
      setError(null);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to refresh portfolio data';
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadData(false);
      }, autoRefreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshInterval, loadData]);

  return {
    data,
    loading,
    error,
    lastFetched,
    isRefreshing,
    refresh,
  };
}
