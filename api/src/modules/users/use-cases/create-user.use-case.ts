import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  CreateUserUseCaseInput,
  ICreateUserUseCase,
} from '@/domain/interfaces/use-cases/users/create-user.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashProvider)
    private readonly hashProvider: IHashProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: CreateUserUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can create users');

    const exists = await this.userRepository.existsByEmail(input.email);
    if (exists) {
      throw new BadRequestException('E-mail already in use');
    }

    const passwordHash = await this.hashProvider.hash(input.password);

    const user = await this.userRepository.createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      profile: input.profile,
      isActive: input.isActive ?? true,
    });

    await this.messagingProvider.publish('users.created', {
      userId: user.id,
      email: user.email,
      profile: user.profile,
    });

    return user;
  }
}
