import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateExamUseCase } from '@/modules/exams/use-cases/create-exam.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: CreateExamUseCase;
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
    useCase: new CreateExamUseCase(examRepository, messagingProvider),
    examRepository,
    messagingProvider,
  };
}

describe('CreateExamUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, examRepository } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        name: 'Exam',
        description: 'Desc',
        durationMinutes: 20,
        priceCents: 1000,
      }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can create exams'));

    expect(examRepository.createExam).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when duration is invalid', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        name: 'Exam',
        durationMinutes: 0,
        priceCents: 1000,
      }),
    ).rejects.toThrow(new BadRequestException('Duration must be greater than zero'));
  });

  it('throws BadRequestException when price is negative', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        name: 'Exam',
        durationMinutes: 30,
        priceCents: -1,
      }),
    ).rejects.toThrow(new BadRequestException('Price cannot be negative'));
  });

  it('creates exam and publishes event on success', async () => {
    const { useCase, examRepository, messagingProvider } = createSut();
    examRepository.createExam.mockResolvedValue(
      makeExamEntity({ id: 'exam-id-1', name: 'Exam A' }),
    );

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      name: 'Exam A',
      description: 'Desc',
      durationMinutes: 30,
      priceCents: 15000,
    });

    expect(examRepository.createExam).toHaveBeenCalledWith({
      name: 'Exam A',
      description: 'Desc',
      durationMinutes: 30,
      priceCents: 15000,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('exams.created', {
      examId: 'exam-id-1',
      name: 'Exam A',
    });
    expect(output.id).toBe('exam-id-1');
  });

  it('sends null description when it is not provided', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.createExam.mockResolvedValue(
      makeExamEntity({ id: 'exam-id-2', name: 'Exam Without Description' }),
    );

    await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      name: 'Exam Without Description',
      durationMinutes: 25,
      priceCents: 8000,
    });

    expect(examRepository.createExam).toHaveBeenCalledWith({
      name: 'Exam Without Description',
      description: null,
      durationMinutes: 25,
      priceCents: 8000,
    });
  });
});
