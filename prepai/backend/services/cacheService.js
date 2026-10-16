const crypto = require("crypto");
const logger = require("../utils/logger");

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.stats = { hits: 0, misses: 0 };
    this.redisClient = null;

    // Periodically clean expired keys from in-memory cache
    setInterval(() => this.cleanupExpired(), 60000);
  }

  hash(input) {
    return crypto.createHash("md5").update(String(input)).digest("hex");
  }

  async get(key) {
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        const val = await this.redisClient.get(key);
        if (val) {
          this.stats.hits++;
          logger.info(`[Cache] Redis HIT for key: ${key}`);
          return JSON.parse(val);
        }
      } catch (err) {
        logger.warn(`[Cache] Redis error on GET, falling back to memory: ${err.message}`);
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) {
      this.stats.misses++;
      logger.info(`[Cache] Memory MISS for key: ${key}`);
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      logger.info(`[Cache] Memory EXPIRED for key: ${key}`);
      return null;
    }

    this.stats.hits++;
    logger.info(`[Cache] Memory HIT for key: ${key}`);
    return item.value;
  }

  async set(key, value, ttlSeconds = 3600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });

    if (this.redisClient && this.redisClient.isOpen) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      } catch (err) {
        logger.warn(`[Cache] Redis error on SET: ${err.message}`);
      }
    }
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  getStats() {
    return {
      ...this.stats,
      cachedKeys: this.memoryCache.size,
      hitRatio: this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) + "%"
        : "0%",
    };
  }
}

module.exports = new CacheService();
