import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import {
  assertOwnerOrAdmin,
  isAdmin,
} from '@/domain/commons/utils/profile-authorization.util';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  IUpdateUserUseCase,
  UpdateUserUseCaseInput,
} from '@/domain/interfaces/use-cases/users/update-user.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashProvider)
    private readonly hashProvider: IHashProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: UpdateUserUseCaseInput) {
    const targetUser = await this.userRepository.findById(input.id);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const userIsAdmin = isAdmin(input.user);
    assertOwnerOrAdmin(input.user, input.id, 'You can only update your own profile');

    if (
      !userIsAdmin &&
      (input.email !== undefined || input.profile !== undefined || input.isActive !== undefined)
    ) {
      throw new ForbiddenException('Only admin users can update e-mail, profile or status');
    }

    if (input.email) {
      const exists = await this.userRepository.existsByEmail(input.email, targetUser.id);
      if (exists) {
        throw new BadRequestException('E-mail already in use');
      }
    }

    const passwordHash =
      input.password !== undefined
        ? await this.hashProvider.hash(input.password)
        : undefined;

    const updated = await this.userRepository.updateUser(targetUser.id, {
      fullName: input.fullName,
      email: userIsAdmin ? input.email : undefined,
      passwordHash,
      profile: userIsAdmin ? input.profile : undefined,
      isActive: userIsAdmin ? input.isActive : undefined,
    });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    await this.messagingProvider.publish('users.updated', {
      userId: updated.id,
      email: updated.email,
      profile: updated.profile,
    });

    return updated;
  }
}
