import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { UserEntity } from '@/domain/entities/user.entity';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { UsersPaginationQuery } from '@/domain/interfaces/repositories/user.repository';

export interface IListUsersUseCase {
  execute(
    user: AuthenticatedUser,
    pagination: UsersPaginationQuery,
  ): Promise<PaginatedResult<UserEntity>>;
}

export const IListUsersUseCase = Symbol('IListUsersUseCase');
