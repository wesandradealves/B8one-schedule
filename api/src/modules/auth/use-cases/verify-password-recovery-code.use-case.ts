import {
  IVerifyPasswordRecoveryCodeUseCase,
  VerifyPasswordRecoveryCodeUseCaseInput,
  VerifyPasswordRecoveryCodeUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/verify-password-recovery-code.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifyPasswordRecoveryCodeUseCase
  implements IVerifyPasswordRecoveryCodeUseCase
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(
    input: VerifyPasswordRecoveryCodeUseCaseInput,
  ): Promise<VerifyPasswordRecoveryCodeUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const code = await this.authRepository.findValidTwoFactorCode(
      user.id,
      input.code,
      new Date(),
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );

    if (!code) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.messagingProvider.publish('auth.password-recovery.verified', {
      userId: user.id,
      email: user.email,
      profile: user.profile,
    });

    return {
      verified: true,
      message: 'Verification code validated successfully.',
    };
  }
}

