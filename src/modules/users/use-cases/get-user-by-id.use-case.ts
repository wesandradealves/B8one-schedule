import { assertOwnerOrAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  GetUserByIdUseCaseInput,
  IGetUserByIdUseCase,
} from '@/domain/interfaces/use-cases/users/get-user-by-id.use-case';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetUserByIdUseCaseInput) {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    assertOwnerOrAdmin(input.user, user.id, 'You can only access your own profile');

    return user;
  }
}
