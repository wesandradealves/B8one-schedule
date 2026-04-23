import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IListUsersUseCase } from '@/domain/interfaces/use-cases/users/list-users.use-case';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListUsersUseCase implements IListUsersUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(user: AuthenticatedUser, pagination: PaginationQuery) {
    if (!isAdmin(user)) {
      const ownUser = await this.userRepository.findById(user.id);
      const total = ownUser ? 1 : 0;
      const offset = (pagination.page - 1) * pagination.limit;
      const data = ownUser && offset === 0 ? [ownUser] : [];

      return {
        data,
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
      };
    }

    return this.userRepository.listAll(pagination);
  }
}
