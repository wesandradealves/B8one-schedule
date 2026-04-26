import { hashEmailConfirmationToken } from '@/domain/commons/utils/email-confirmation-token.util';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  IVerifyEmailConfirmationUseCase,
  VerifyEmailConfirmationUseCaseInput,
  VerifyEmailConfirmationUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/verify-email-confirmation.use-case';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyEmailConfirmationUseCase
  implements IVerifyEmailConfirmationUseCase
{
  private static readonly INVALID_LINK_MESSAGE =
    'Invalid or expired e-mail confirmation link';

  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(
    input: VerifyEmailConfirmationUseCaseInput,
  ): Promise<VerifyEmailConfirmationUseCaseOutput> {
    const rawToken = input.token.trim();
    if (!rawToken) {
      throw new BadRequestException(
        VerifyEmailConfirmationUseCase.INVALID_LINK_MESSAGE,
      );
    }

    const now = new Date();
    const tokenHash = hashEmailConfirmationToken(rawToken);

    const confirmationToken = await this.authRepository.findValidEmailConfirmationToken(
      tokenHash,
      now,
    );

    if (!confirmationToken) {
      throw new BadRequestException(
        VerifyEmailConfirmationUseCase.INVALID_LINK_MESSAGE,
      );
    }

    const user = await this.userRepository.findById(confirmationToken.userId);

    if (!user) {
      throw new BadRequestException(
        VerifyEmailConfirmationUseCase.INVALID_LINK_MESSAGE,
      );
    }

    if (!user.isActive) {
      await this.userRepository.updateUser(user.id, {
        isActive: true,
      });
    }

    await this.authRepository.invalidateEmailConfirmationToken(
      confirmationToken.id,
      now,
    );

    await this.messagingProvider.publish('auth.email-confirmation.completed', {
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'E-mail confirmado com sucesso. Conta ativada.',
    };
  }
}
