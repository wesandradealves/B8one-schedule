import {
  ILoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/login.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashProvider)
    private readonly hashProvider: IHashProvider,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IEmailProvider)
    private readonly emailProvider: IEmailProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashProvider.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const code = this.generateCode();
    const expirationMinutes = this.configService.get<number>(
      'auth.twoFactor.expirationMinutes',
      10,
    );
    const smtpHost = this.configService.get<string>('email.smtp.host');
    const appEnv = this.configService.get<string>('env');

    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.authRepository.upsertTwoFactorCode(user.id, code, expiresAt);

    if (!smtpHost && appEnv !== 'production') {
      this.logger.warn(`SMTP_HOST not configured. 2FA code for ${user.email}: ${code}`);
    }

    await this.emailProvider.send({
      to: user.email,
      subject: 'Seu código de verificação (2FA)',
      html: `<p>Seu código de acesso é <strong>${code}</strong>.</p><p>Válido por ${expirationMinutes} minutos.</p>`,
    });

    try {
      await this.messagingProvider.publish('auth.two-factor.requested', {
        userId: user.id,
        email: user.email,
        profile: user.profile,
      });
    } catch (error) {
      this.logger.warn('Failed to publish auth.two-factor.requested event');
      this.logger.debug(String(error));
    }

    return {
      requiresTwoFactor: true,
      message: '2FA code sent to your e-mail.',
    };
  }

  private generateCode(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }
}
