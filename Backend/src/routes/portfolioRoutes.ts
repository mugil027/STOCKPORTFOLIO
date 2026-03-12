import { Router, Request, Response, NextFunction } from 'express';
import { getEnrichedPortfolio } from '../services/portfolioService';
import { cacheService } from '../services/cacheService';
import { portfolioHoldings } from '../data/holdings';

const router = Router();

/**
 * GET /api/portfolio
 *
 * Returns the full enriched portfolio with live market data.
 * Includes sector grouping, computed fields, and portfolio totals.
 */
router.get(
  '/portfolio',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const portfolio = await getEnrichedPortfolio();
      res.json(portfolio);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/holdings
 *
 * Returns only the static holdings data (no live market data).
 * Useful for quick loading while live data is being fetched.
 */
router.get(
  '/holdings',
  (_req: Request, res: Response): void => {
    const totalInvestment = portfolioHoldings.reduce(
      (sum, h) => sum + h.purchasePrice * h.quantity,
      0
    );

    const holdings = portfolioHoldings.map((h) => ({
      ...h,
      investment: h.purchasePrice * h.quantity,
      portfolioPercent:
        ((h.purchasePrice * h.quantity) / totalInvestment) * 100,
    }));

    res.json({
      holdings,
      totalInvestment,
      count: holdings.length,
    });
  }
);

/**
 * POST /api/refresh
 *
 * Force-refresh the cache and fetch fresh data from all APIs.
 */
router.post(
  '/refresh',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear all cached data
      cacheService.flush();
      console.log('[Cache] Flushed all cached data');

      // Fetch fresh data
      const portfolio = await getEnrichedPortfolio();
      res.json({
        message: 'Portfolio refreshed successfully',
        portfolio,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/cache-stats
 *
 * Returns cache statistics for monitoring/debugging.
 */
router.get(
  '/cache-stats',
  (_req: Request, res: Response): void => {
    res.json({
      stats: cacheService.getStats(),
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * GET /api/health
 *
 * Health check endpoint.
 */
router.get(
  '/health',
  (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
);

export default router;
