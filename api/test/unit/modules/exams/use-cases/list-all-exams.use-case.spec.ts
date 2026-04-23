import { EXAMS_LIST_CACHE_VERSION_KEY } from '@/domain/commons/constants/exam-cache.constant';
import {
  buildExamsListCacheKey,
  EXAMS_LIST_CACHE_TTL_SECONDS,
} from '@/domain/commons/utils/exam-cache.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { ListAllExamsUseCase } from '@/modules/exams/use-cases/list-all-exams.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ListAllExamsUseCase;
  examRepository: jest.Mocked<IExamRepository>;
  cacheProvider: jest.Mocked<ICacheProvider>;
};

function createSut(): Sut {
  const examRepository: jest.Mocked<IExamRepository> = {
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    findAnyById: jest.fn(),
    createExam: jest.fn(),
    updateExam: jest.fn(),
    deleteExam: jest.fn(),
  };

  const cacheProvider: jest.Mocked<ICacheProvider> = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  return {
    useCase: new ListAllExamsUseCase(examRepository, cacheProvider),
    examRepository,
    cacheProvider,
  };
}

describe('ListAllExamsUseCase', () => {
  it('returns cached result for admin when cache hit happens', async () => {
    const { useCase, examRepository, cacheProvider } = createSut();
    const pagination = { page: 1, limit: 10 };
    const cachedResult = {
      data: [makeExamEntity({ id: 'exam-id-cached' })],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };
    const cacheVersion = '7';
    const cacheKey = buildExamsListCacheKey(cacheVersion, 'all', pagination);

    cacheProvider.get
      .mockResolvedValueOnce(cacheVersion)
      .mockResolvedValueOnce(cachedResult);

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      pagination,
    );

    expect(cacheProvider.get).toHaveBeenNthCalledWith(1, EXAMS_LIST_CACHE_VERSION_KEY);
    expect(cacheProvider.get).toHaveBeenNthCalledWith(2, cacheKey);
    expect(examRepository.listAll).not.toHaveBeenCalled();
    expect(examRepository.listActive).not.toHaveBeenCalled();
    expect(cacheProvider.set).not.toHaveBeenCalled();
    expect(output.total).toBe(1);
  });

  it('queries repository and caches result for admin when cache miss happens', async () => {
    const { useCase, examRepository, cacheProvider } = createSut();
    const pagination = { page: 1, limit: 10 };
    const repositoryResult = {
      data: [makeExamEntity({ id: 'exam-id-1' })],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };
    const cacheVersion = '9';
    const cacheKey = buildExamsListCacheKey(cacheVersion, 'all', pagination);

    cacheProvider.get
      .mockResolvedValueOnce(cacheVersion)
      .mockResolvedValueOnce(null);
    examRepository.listAll.mockResolvedValue(repositoryResult);

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      pagination,
    );

    expect(examRepository.listAll).toHaveBeenCalledWith(pagination);
    expect(examRepository.listActive).not.toHaveBeenCalled();
    expect(cacheProvider.set).toHaveBeenCalledWith(
      cacheKey,
      repositoryResult,
      EXAMS_LIST_CACHE_TTL_SECONDS,
    );
    expect(output.total).toBe(1);
  });

  it('queries listActive and caches result for client with default version fallback', async () => {
    const { useCase, examRepository, cacheProvider } = createSut();
    const pagination = { page: 2, limit: 5 };
    const repositoryResult = {
      data: [makeExamEntity({ id: 'exam-id-1' })],
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
    };
    const cacheKey = buildExamsListCacheKey('1', 'active', pagination);

    cacheProvider.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    examRepository.listActive.mockResolvedValue(repositoryResult);

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      pagination,
    );

    expect(cacheProvider.get).toHaveBeenNthCalledWith(1, EXAMS_LIST_CACHE_VERSION_KEY);
    expect(cacheProvider.get).toHaveBeenNthCalledWith(2, cacheKey);
    expect(examRepository.listActive).toHaveBeenCalledWith(pagination);
    expect(examRepository.listAll).not.toHaveBeenCalled();
    expect(cacheProvider.set).toHaveBeenCalledWith(
      cacheKey,
      repositoryResult,
      EXAMS_LIST_CACHE_TTL_SECONDS,
    );
    expect(output.page).toBe(2);
  });
});
