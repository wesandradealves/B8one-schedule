import { EXAMS_LIST_CACHE_VERSION_KEY } from '@/domain/commons/constants/exam-cache.constant';
import {
  buildExamsListCacheKey,
  bumpExamsListCacheVersion,
  getExamsListCacheVersion,
} from '@/domain/commons/utils/exam-cache.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';

describe('exam-cache.util', () => {
  it('builds list cache key with version, scope and pagination', () => {
    const key = buildExamsListCacheKey('12', 'active', { page: 3, limit: 25 });

    expect(key).toBe('exams:list:v:12:scope:active:page:3:limit:25:sort:DESC');
  });

  it('returns current cache version when version exists', async () => {
    const cacheProvider: jest.Mocked<ICacheProvider> = {
      get: jest.fn().mockResolvedValue('42'),
      set: jest.fn(),
      del: jest.fn(),
    };

    const version = await getExamsListCacheVersion(cacheProvider);

    expect(cacheProvider.get).toHaveBeenCalledWith(EXAMS_LIST_CACHE_VERSION_KEY);
    expect(version).toBe('42');
  });

  it('returns default version when version is missing', async () => {
    const cacheProvider: jest.Mocked<ICacheProvider> = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
    };

    const version = await getExamsListCacheVersion(cacheProvider);

    expect(version).toBe('1');
  });

  it('bumps cache version key', async () => {
    const cacheProvider: jest.Mocked<ICacheProvider> = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    await bumpExamsListCacheVersion(cacheProvider);

    expect(cacheProvider.set).toHaveBeenCalledWith(
      EXAMS_LIST_CACHE_VERSION_KEY,
      expect.any(String),
    );
  });
});
