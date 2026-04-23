import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteExamUseCase } from '@/modules/exams/use-cases/delete-exam.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { makeAuthenticatedUser } from '../../../helpers/factories';

type Sut = {
  useCase: DeleteExamUseCase;
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
    useCase: new DeleteExamUseCase(examRepository, messagingProvider),
    examRepository,
    messagingProvider,
  };
}

describe('DeleteExamUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, examRepository } = createSut();

    await expect(
      useCase.execute({ id: 'exam-id-1', user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }) }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can delete exams'));

    expect(examRepository.deleteExam).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.deleteExam.mockResolvedValue(false);

    await expect(
      useCase.execute({ id: 'missing-id', user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }) }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('deletes exam and publishes event', async () => {
    const { useCase, examRepository, messagingProvider } = createSut();
    examRepository.deleteExam.mockResolvedValue(true);

    await expect(
      useCase.execute({ id: 'exam-id-1', user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }) }),
    ).resolves.toBeUndefined();

    expect(messagingProvider.publish).toHaveBeenCalledWith('exams.deleted', {
      examId: 'exam-id-1',
    });
  });
});
