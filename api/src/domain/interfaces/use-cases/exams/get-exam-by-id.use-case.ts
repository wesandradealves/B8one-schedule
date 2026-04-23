import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { ExamEntity } from '@/domain/entities/exam.entity';

export interface GetExamByIdUseCaseInput {
  id: string;
  user: AuthenticatedUser;
}

export interface IGetExamByIdUseCase {
  execute(input: GetExamByIdUseCaseInput): Promise<ExamEntity>;
}

export const IGetExamByIdUseCase = Symbol('IGetExamByIdUseCase');
