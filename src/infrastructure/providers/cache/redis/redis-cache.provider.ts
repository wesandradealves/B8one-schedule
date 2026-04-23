import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheProvider implements ICacheProvider {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.cacheManager.get<T>(key);
    return data ?? null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
