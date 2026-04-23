import { PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import {
  EXAMS_LIST_CACHE_TTL_SECONDS,
  EXAMS_LIST_CACHE_VERSION_KEY,
} from '@/domain/commons/constants/exam-cache.constant';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';

const EXAMS_LIST_CACHE_KEY_PREFIX = 'exams:list';

export type ExamsListScope = 'all' | 'active';

export function buildExamsListCacheKey(
  version: string,
  scope: ExamsListScope,
  pagination: PaginationQuery,
): string {
  return `${EXAMS_LIST_CACHE_KEY_PREFIX}:v:${version}:scope:${scope}:page:${pagination.page}:limit:${pagination.limit}`;
}

export async function getExamsListCacheVersion(
  cacheProvider: ICacheProvider,
): Promise<string> {
  const currentVersion = await cacheProvider.get<string>(EXAMS_LIST_CACHE_VERSION_KEY);

  if (currentVersion) {
    return currentVersion;
  }

  return '1';
}

export async function bumpExamsListCacheVersion(
  cacheProvider: ICacheProvider,
): Promise<void> {
  const nextVersion = Date.now().toString();
  await cacheProvider.set(EXAMS_LIST_CACHE_VERSION_KEY, nextVersion);
}

export { EXAMS_LIST_CACHE_TTL_SECONDS };
