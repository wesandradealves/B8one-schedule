import { ExamEntity } from '@/domain/entities/exam.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface CreateExamUseCaseInput {
  user: AuthenticatedUser;
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceCents: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

export interface ICreateExamUseCase {
  execute(input: CreateExamUseCaseInput): Promise<ExamEntity>;
}

export const ICreateExamUseCase = Symbol('ICreateExamUseCase');
