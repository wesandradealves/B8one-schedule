import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import {
  IUpdateExamUseCase,
  UpdateExamUseCaseInput,
} from '@/domain/interfaces/use-cases/exams/update-exam.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UpdateExamUseCase implements IUpdateExamUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: UpdateExamUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can update exams');

    if (input.durationMinutes !== undefined && input.durationMinutes <= 0) {
      throw new BadRequestException('Duration must be greater than zero');
    }
    if (input.priceCents !== undefined && input.priceCents < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    const updated = await this.examRepository.updateExam(input.id, {
      name: input.name,
      description: input.description,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      isActive: input.isActive,
    });

    if (!updated) {
      throw new NotFoundException('Exam not found');
    }

    await this.messagingProvider.publish('exams.updated', {
      examId: updated.id,
      name: updated.name,
    });

    return updated;
  }
}
