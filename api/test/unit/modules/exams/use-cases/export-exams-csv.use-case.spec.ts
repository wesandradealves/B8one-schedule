import { ForbiddenException } from '@nestjs/common';
import { ExportExamsCsvUseCase } from '@/modules/exams/use-cases/export-exams-csv.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ExportExamsCsvUseCase;
  examRepository: jest.Mocked<IExamRepository>;
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

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new ExportExamsCsvUseCase(examRepository, messagingProvider),
    examRepository,
    messagingProvider,
  };
}

describe('ExportExamsCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can export exams CSV'),
    );
  });

  it('exports exams csv and publishes event', async () => {
    const { useCase, examRepository, messagingProvider } = createSut();

    examRepository.listAll.mockResolvedValue({
      data: [makeExamEntity({ id: 'exam-id-1', name: 'Exam A' })],
      page: 1,
      limit: 500,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
    });

    expect(output.fileName).toContain('exams-');
    expect(output.csvContent).toContain(
      'id,name,description,durationMinutes,priceCents,isActive,createdAt,updatedAt',
    );
    expect(output.csvContent).toContain('Exam A');
    expect(messagingProvider.publish).toHaveBeenCalledWith('exams.csv.exported', {
      exportedByUserId: 'user-id-1',
      totalRows: 1,
      fileName: output.fileName,
    });
  });
});
