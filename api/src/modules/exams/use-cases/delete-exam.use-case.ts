import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import {
  DeleteExamUseCaseInput,
  IDeleteExamUseCase,
} from '@/domain/interfaces/use-cases/exams/delete-exam.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteExamUseCase implements IDeleteExamUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: DeleteExamUseCaseInput): Promise<void> {
    assertAdmin(input.user, 'Only admin users can delete exams');

    const deleted = await this.examRepository.deleteExam(input.id);

    if (!deleted) {
      throw new NotFoundException('Exam not found');
    }

    await this.messagingProvider.publish('exams.deleted', {
      examId: input.id,
    });
  }
}
