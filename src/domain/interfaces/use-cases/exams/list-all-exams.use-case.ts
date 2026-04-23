import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';

export interface IListAllExamsUseCase {
  execute(user: AuthenticatedUser, pagination: PaginationQuery): Promise<PaginatedResult<ExamEntity>>;
}

export const IListAllExamsUseCase = Symbol('IListAllExamsUseCase');
