import { EXAMS_LIST_CACHE_VERSION_KEY } from '@/domain/commons/constants/exam-cache.constant';
import {
  DEFAULT_EXAM_AVAILABLE_END_TIME,
  DEFAULT_EXAM_AVAILABLE_START_TIME,
  DEFAULT_EXAM_AVAILABLE_WEEKDAYS,
} from '@/domain/commons/utils/exam-availability.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateExamUseCase } from '@/modules/exams/use-cases/update-exam.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: UpdateExamUseCase;
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

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const cacheProvider: jest.Mocked<ICacheProvider> = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  return {
    useCase: new UpdateExamUseCase(examRepository, cacheProvider, messagingProvider),
    examRepository,
    cacheProvider,
    messagingProvider,
  };
}

describe('UpdateExamUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, examRepository } = createSut();

    await expect(
      useCase.execute({
        id: 'exam-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        name: 'Updated',
      }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can update exams'));

    expect(examRepository.updateExam).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when duration is invalid', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findAnyById.mockResolvedValue(
      makeExamEntity({
        id: 'exam-id-1',
        availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
        availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
        availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
        availableFromDate: null,
        availableToDate: null,
      }),
    );

    await expect(
      useCase.execute({
        id: 'exam-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        durationMinutes: 0,
      }),
    ).rejects.toThrow(new BadRequestException('Duration must be greater than zero'));
  });

  it('throws BadRequestException when price is negative', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findAnyById.mockResolvedValue(
      makeExamEntity({
        id: 'exam-id-1',
        availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
        availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
        availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
        availableFromDate: null,
        availableToDate: null,
      }),
    );

    await expect(
      useCase.execute({
        id: 'exam-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        priceCents: -10,
      }),
    ).rejects.toThrow(new BadRequestException('Price cannot be negative'));
  });

  it('throws NotFoundException when exam does not exist before update', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findAnyById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'missing-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        name: 'Updated',
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findAnyById.mockResolvedValue(makeExamEntity({ id: 'missing-id' }));
    examRepository.updateExam.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'missing-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        name: 'Updated',
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('updates exam and publishes event', async () => {
    const { useCase, examRepository, cacheProvider, messagingProvider } = createSut();

    examRepository.findAnyById.mockResolvedValue(
      makeExamEntity({
        id: 'exam-id-1',
        availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
        availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
        availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
        availableFromDate: null,
        availableToDate: null,
      }),
    );
    examRepository.updateExam.mockResolvedValue(
      makeExamEntity({ id: 'exam-id-1', name: 'Updated Exam' }),
    );

    const output = await useCase.execute({
      id: 'exam-id-1',
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      name: 'Updated Exam',
      durationMinutes: 40,
      priceCents: 20000,
      isActive: true,
    });

    expect(examRepository.updateExam).toHaveBeenCalledWith('exam-id-1', {
      name: 'Updated Exam',
      description: undefined,
      durationMinutes: 40,
      priceCents: 20000,
      availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
      availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
      availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
      availableFromDate: null,
      availableToDate: null,
      isActive: true,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('exams.updated', {
      examId: 'exam-id-1',
      name: 'Updated Exam',
    });
    expect(cacheProvider.set).toHaveBeenCalledWith(
      EXAMS_LIST_CACHE_VERSION_KEY,
      expect.any(String),
    );
    expect(output.id).toBe('exam-id-1');
  });
});
