import { bumpExamsListCacheVersion } from '@/domain/commons/utils/exam-cache.util';
import {
  normalizeExamAvailability,
  validateExamAvailability,
} from '@/domain/commons/utils/exam-availability.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import {
  CreateExamUseCaseInput,
  ICreateExamUseCase,
} from '@/domain/interfaces/use-cases/exams/create-exam.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateExamUseCase implements ICreateExamUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(ICacheProvider)
    private readonly cacheProvider: ICacheProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: CreateExamUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can create exams');

    if (input.durationMinutes <= 0) {
      throw new BadRequestException('Duration must be greater than zero');
    }
    if (input.priceCents < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    const availability = normalizeExamAvailability({
      availableWeekdays: input.availableWeekdays,
      availableStartTime: input.availableStartTime,
      availableEndTime: input.availableEndTime,
      availableFromDate: input.availableFromDate,
      availableToDate: input.availableToDate,
    });
    validateExamAvailability(availability);

    const exam = await this.examRepository.createExam({
      name: input.name,
      description: input.description ?? null,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      ...availability,
    });

    await bumpExamsListCacheVersion(this.cacheProvider);

    await this.messagingProvider.publish('exams.created', {
      examId: exam.id,
      name: exam.name,
    });

    return exam;
  }
}
