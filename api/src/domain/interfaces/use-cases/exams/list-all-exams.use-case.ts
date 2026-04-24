import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { ExamPaginationQuery } from '@/domain/interfaces/repositories/exam.repository';

export interface IListAllExamsUseCase {
  execute(user: AuthenticatedUser, pagination: ExamPaginationQuery): Promise<PaginatedResult<ExamEntity>>;
}

export const IListAllExamsUseCase = Symbol('IListAllExamsUseCase');
