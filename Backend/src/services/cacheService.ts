import NodeCache from 'node-cache';

/**
 * In-memory cache layer to reduce API calls and avoid rate limiting.
 * Default TTL: 60 seconds (configurable via .env)
 */
const cacheTTL = parseInt(process.env.CACHE_TTL || '60', 10);

const cache = new NodeCache({
  stdTTL: cacheTTL,
  checkperiod: cacheTTL * 0.2, // Check for expired keys at 20% of TTL
  useClones: false,             // Better performance, we handle immutability ourselves
});

export const cacheService = {
  /**
   * Get a cached value by key.
   */
  get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  },

  /**
   * Set a value in cache with optional custom TTL.
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  },

  /**
   * Delete a specific key from cache.
   */
  del(key: string): number {
    return cache.del(key);
  },

  /**
   * Flush the entire cache (useful for force-refresh).
   */
  flush(): void {
    cache.flushAll();
  },

  /**
   * Get cache stats for monitoring.
   */
  getStats() {
    return cache.getStats();
  },
};
