// Simple in-memory price cache to reduce CoinGecko API calls
// Caches prices for 60 seconds

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

export function getCached(key) {
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache() {
  cache.clear();
}

// Get cache stats (useful for debugging)
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    ttl: CACHE_TTL
  };
}
