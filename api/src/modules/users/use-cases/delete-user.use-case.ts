import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import {
  DeleteUserUseCaseInput,
  IDeleteUserUseCase,
} from '@/domain/interfaces/use-cases/users/delete-user.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: DeleteUserUseCaseInput): Promise<void> {
    assertAdmin(input.user, 'Only admin users can delete users');

    const deleted = await this.userRepository.deleteUser(input.id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    await this.messagingProvider.publish('users.deleted', {
      userId: input.id,
    });
  }
}
