import { RedisCacheProvider } from '@/infrastructure/providers/cache/redis/redis-cache.provider';

type CacheManagerMock = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

function createSut() {
  const cacheManager: CacheManagerMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const provider = new RedisCacheProvider(cacheManager as never);

  return { provider, cacheManager };
}

describe('RedisCacheProvider', () => {
  it('sets key with TTL converted from seconds to milliseconds', async () => {
    const { provider, cacheManager } = createSut();

    await provider.set('exams:list:key', { ok: true }, 300);

    expect(cacheManager.set).toHaveBeenCalledWith(
      'exams:list:key',
      { ok: true },
      300000,
    );
  });

  it('sets key without TTL when ttlSeconds is not provided', async () => {
    const { provider, cacheManager } = createSut();

    await provider.set('exams:list:key', { ok: true });

    expect(cacheManager.set).toHaveBeenCalledWith('exams:list:key', { ok: true });
  });

  it('returns null when key is not found', async () => {
    const { provider, cacheManager } = createSut();
    cacheManager.get.mockResolvedValue(undefined);

    const value = await provider.get('missing-key');

    expect(value).toBeNull();
  });
});
