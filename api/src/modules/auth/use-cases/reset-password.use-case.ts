import {
  IResetPasswordUseCase,
  ResetPasswordUseCaseInput,
  ResetPasswordUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/reset-password.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IHashProvider)
    private readonly hashProvider: IHashProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ResetPasswordUseCaseInput): Promise<ResetPasswordUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const validCode = await this.authRepository.findValidTwoFactorCode(
      user.id,
      input.code,
      new Date(),
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );

    if (!validCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const passwordHash = await this.hashProvider.hash(input.newPassword);
    const updatedUser = await this.userRepository.updateUser(user.id, { passwordHash });

    if (!updatedUser) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.authRepository.invalidateTwoFactorCode(validCode.id, new Date());

    await this.messagingProvider.publish('auth.password-recovery.completed', {
      userId: user.id,
      email: user.email,
      profile: user.profile,
    });

    return {
      message: 'Password updated successfully.',
    };
  }
}

