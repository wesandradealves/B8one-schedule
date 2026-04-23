import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { UserEntity } from '@/domain/entities/user.entity';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';

export interface IListUsersUseCase {
  execute(user: AuthenticatedUser, pagination: PaginationQuery): Promise<PaginatedResult<UserEntity>>;
}

export const IListUsersUseCase = Symbol('IListUsersUseCase');
