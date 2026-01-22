/**
 * Redis caching utility
 * Falls back gracefully if Redis is not available
 */

let redis = null;

// Try to initialize Redis (optional dependency)
try {
  const Redis = (await import('ioredis')).default;
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
    console.log('✅ Redis cache enabled');
  }
} catch (error) {
  console.log('⚠️  Redis not available, caching disabled');
}

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value or null
 */
export async function getCache(key) {
  if (!redis) return null;
  
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function setCache(key, value, ttlSeconds = 300) {
  if (!redis) return;
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached value
 * @param {string} key - Cache key
 */
export async function deleteCache(key) {
  if (!redis) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete cache by pattern
 * @param {string} pattern - Pattern to match (e.g., 'ra:*')
 */
export async function deleteCachePattern(pattern) {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error);
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  ra: (id) => `ra:${id}`,
  raReviews: (id) => `ra:${id}:reviews`,
  search: (query, schoolId) => `search:${query}:${schoolId || 'all'}`,
  school: (id) => `school:${id}`,
};
