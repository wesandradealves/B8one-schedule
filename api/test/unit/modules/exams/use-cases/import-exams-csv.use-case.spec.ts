import { ForbiddenException } from '@nestjs/common';
import { ImportExamsCsvUseCase } from '@/modules/exams/use-cases/import-exams-csv.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { EXAMS_LIST_CACHE_VERSION_KEY } from '@/domain/commons/constants/exam-cache.constant';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ImportExamsCsvUseCase;
  examRepository: jest.Mocked<IExamRepository>;
  cacheProvider: jest.Mocked<ICacheProvider>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
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

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new ImportExamsCsvUseCase(
      examRepository,
      cacheProvider,
      messagingProvider,
    ),
    examRepository,
    cacheProvider,
    messagingProvider,
  };
}

describe('ImportExamsCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        csvContent: 'name,durationMinutes,priceCents,isActive\nExam,30,1000,true',
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can import exams CSV'),
    );
  });

  it('imports new exams and updates existing exams', async () => {
    const { useCase, examRepository, cacheProvider, messagingProvider } = createSut();

    examRepository.findAnyById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    examRepository.createExam.mockResolvedValue(makeExamEntity({ id: 'new-exam-id' }));
    examRepository.updateExam.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'id,name,description,durationMinutes,priceCents,isActive\n' +
        ',New Exam,Desc,30,1000,true\n' +
        'exam-id-1,Updated Exam,New Desc,45,2500,false',
    });

    expect(output).toEqual({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    expect(cacheProvider.set).toHaveBeenCalledWith(
      EXAMS_LIST_CACHE_VERSION_KEY,
      expect.any(String),
    );
    expect(messagingProvider.publish).toHaveBeenCalledWith('exams.csv.imported', {
      importedByUserId: 'user-id-1',
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
    });
  });
});
