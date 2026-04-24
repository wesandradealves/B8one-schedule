import {
  buildExamsListCacheKey,
  EXAMS_LIST_CACHE_TTL_SECONDS,
  getExamsListCacheVersion,
} from '@/domain/commons/utils/exam-cache.util';
import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { ExamPaginationQuery, IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IListAllExamsUseCase } from '@/domain/interfaces/use-cases/exams/list-all-exams.use-case';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListAllExamsUseCase implements IListAllExamsUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(ICacheProvider)
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(user: AuthenticatedUser, pagination: ExamPaginationQuery) {
    const scope = isAdmin(user) ? 'all' : 'active';
    const cacheVersion = await getExamsListCacheVersion(this.cacheProvider);
    const cacheKey = buildExamsListCacheKey(cacheVersion, scope, pagination);

    const cachedResult = await this.cacheProvider.get<Awaited<ReturnType<IExamRepository['listAll']>>>(
      cacheKey,
    );

    if (cachedResult) {
      return cachedResult;
    }

    const result = scope === 'all'
      ? await this.examRepository.listAll(pagination)
      : await this.examRepository.listActive(pagination);

    await this.cacheProvider.set(cacheKey, result, EXAMS_LIST_CACHE_TTL_SECONDS);

    return result;
  }
}
