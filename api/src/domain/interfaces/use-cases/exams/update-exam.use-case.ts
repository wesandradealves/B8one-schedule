import { ExamEntity } from '@/domain/entities/exam.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface UpdateExamUseCaseInput {
  id: string;
  user: AuthenticatedUser;
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  isActive?: boolean;
}

export interface IUpdateExamUseCase {
  execute(input: UpdateExamUseCaseInput): Promise<ExamEntity>;
}

export const IUpdateExamUseCase = Symbol('IUpdateExamUseCase');
