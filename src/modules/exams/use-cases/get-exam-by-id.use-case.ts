import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  GetExamByIdUseCaseInput,
  IGetExamByIdUseCase,
} from '@/domain/interfaces/use-cases/exams/get-exam-by-id.use-case';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetExamByIdUseCase implements IGetExamByIdUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
  ) {}

  async execute(input: GetExamByIdUseCaseInput) {
    const exam = isAdmin(input.user)
      ? await this.examRepository.findAnyById(input.id)
      : await this.examRepository.findById(input.id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }
}
