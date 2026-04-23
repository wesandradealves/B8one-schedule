import {
  IRequestPasswordRecoveryUseCase,
  RequestPasswordRecoveryUseCaseInput,
  RequestPasswordRecoveryUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/request-password-recovery.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestPasswordRecoveryUseCase
  implements IRequestPasswordRecoveryUseCase
{
  private readonly logger = new Logger(RequestPasswordRecoveryUseCase.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IEmailProvider)
    private readonly emailProvider: IEmailProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: RequestPasswordRecoveryUseCaseInput,
  ): Promise<RequestPasswordRecoveryUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    const genericOutput: RequestPasswordRecoveryUseCaseOutput = {
      requiresTwoFactor: true,
      message: 'If the e-mail exists, a verification code was sent.',
    };

    if (!user || !user.isActive) {
      return genericOutput;
    }

    const code = this.generateCode();
    const expirationMinutes = this.configService.get<number>(
      'auth.twoFactor.expirationMinutes',
      10,
    );
    const smtpHost = this.configService.get<string>('email.smtp.host');
    const appEnv = this.configService.get<string>('env');
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.authRepository.upsertTwoFactorCode(
      user.id,
      code,
      expiresAt,
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );

    if (!smtpHost && appEnv !== 'production') {
      this.logger.warn(
        `SMTP_HOST not configured. Password recovery code for ${user.email}: ${code}`,
      );
    }

    await this.emailProvider.send({
      to: user.email,
      subject: 'Seu código de recuperação de senha',
      html: `<p>Seu código de recuperação é <strong>${code}</strong>.</p><p>Válido por ${expirationMinutes} minutos.</p>`,
    });

    await this.messagingProvider.publish('auth.password-recovery.requested', {
      userId: user.id,
      email: user.email,
      profile: user.profile,
    });

    return genericOutput;
  }

  private generateCode(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }
}

