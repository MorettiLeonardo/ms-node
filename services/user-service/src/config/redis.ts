import Redis from 'ioredis';
import { env } from '@src/config/env.js';
import { DEFAULT_CACHE_TTL_SECONDS } from '@src/constants/index.js';
import type { ICacheService } from '@src/types/cache/index.js';
import type { ResultTuple } from '@src/types/shared/index.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const retry_delay = Math.min(times * 200, 2000);
    return retry_delay;
  },
  lazyConnect: true
});

export class RedisCacheService implements ICacheService {
  constructor(private readonly client: Redis = redis) {}

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      process.stderr.write(`Failed to establish Redis connection: ${String(error)}\n`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      process.stderr.write(`Error during Redis disconnection: ${String(error)}\n`);
    }
  }

  async get<T>(key: string): Promise<ResultTuple<T>> {
    try {
      const cached_data = await this.client.get(key);
      if (!cached_data) {
        const result: ResultTuple<T> = [null, null];
        return result;
      }
      const parsed_data = JSON.parse(cached_data) as T;
      const result: ResultTuple<T> = [parsed_data, null];
      return result;
    } catch (error) {
      const result: ResultTuple<T> = [null, error as Error];
      return result;
    }
  }

  async set(key: string, value: unknown, ttl_seconds = DEFAULT_CACHE_TTL_SECONDS): Promise<ResultTuple<void>> {
    try {
      const serialized_value = JSON.stringify(value);
      if (ttl_seconds > 0) {
        await this.client.set(key, serialized_value, 'EX', ttl_seconds);
      } else {
        await this.client.set(key, serialized_value);
      }
      const result: ResultTuple<void> = [undefined, null];
      return result;
    } catch (error) {
      const result: ResultTuple<void> = [null, error as Error];
      return result;
    }
  }

  async del(key: string): Promise<ResultTuple<void>> {
    try {
      await this.client.del(key);
      const result: ResultTuple<void> = [undefined, null];
      return result;
    } catch (error) {
      const result: ResultTuple<void> = [null, error as Error];
      return result;
    }
  }

  async del_by_pattern(pattern: string): Promise<ResultTuple<void>> {
    try {
      const matched_keys = await this.client.keys(pattern);
      if (matched_keys.length > 0) {
        await this.client.del(...matched_keys);
      }
      const result: ResultTuple<void> = [undefined, null];
      return result;
    } catch (error) {
      const result: ResultTuple<void> = [null, error as Error];
      return result;
    }
  }
}

export const cacheService = new RedisCacheService(redis);
