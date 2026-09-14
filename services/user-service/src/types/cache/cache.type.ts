import type { ResultTuple } from '@src/types/shared/index.js';

export interface ICacheService {
  get<T>(key: string): Promise<ResultTuple<T>>;
  set(key: string, value: unknown, ttl_seconds?: number): Promise<ResultTuple<void>>;
  del(key: string): Promise<ResultTuple<void>>;
  del_by_pattern(pattern: string): Promise<ResultTuple<void>>;
}
