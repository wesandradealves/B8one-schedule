import {
  generateEmailConfirmationToken,
  hashEmailConfirmationToken,
} from '@/domain/commons/utils/email-confirmation-token.util';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  CreateUserUseCaseInput,
  ICreateUserUseCase,
} from '@/domain/interfaces/use-cases/users/create-user.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

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
      isActive: false,
    });

    const confirmationToken = generateEmailConfirmationToken();
    const confirmationTokenHash = hashEmailConfirmationToken(confirmationToken);
    const expirationHours = this.configService.get<number>(
      'auth.emailConfirmation.expirationHours',
      48,
    );
    const confirmationExpiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    await this.authRepository.upsertEmailConfirmationToken(
      user.id,
      confirmationTokenHash,
      confirmationExpiresAt,
    );

    const frontendBaseUrl = this.configService.get<string>(
      'application.frontendBaseUrl',
      'http://localhost:3001',
    );
    const confirmationUrl = `${frontendBaseUrl.replace(/\/+$/, '')}/confirm-email?token=${encodeURIComponent(confirmationToken)}`;
    const smtpHost = this.configService.get<string>('email.smtp.host');
    const appEnv = this.configService.get<string>('env');

    if (!smtpHost && appEnv !== 'production') {
      this.logger.warn(
        `SMTP_HOST not configured. Email confirmation link for ${user.email}: ${confirmationUrl}`,
      );
    }

    await this.emailProvider.send({
      to: user.email,
      subject: 'Confirme seu e-mail para ativar sua conta',
      html:
        `<p>Olá, ${user.fullName}.</p>` +
        `<p>Seu cadastro foi criado e precisa de confirmação para ativação.</p>` +
        `<p><a href="${confirmationUrl}" target="_blank" rel="noopener noreferrer">Confirmar e-mail</a></p>` +
        `<p>Este link expira em ${expirationHours} horas.</p>`,
    });

    await this.messagingProvider.publish('users.created', {
      userId: user.id,
      email: user.email,
      profile: user.profile,
      isActive: user.isActive,
    });

    await this.messagingProvider.publish('auth.email-confirmation.requested', {
      userId: user.id,
      email: user.email,
      expiresAt: confirmationExpiresAt.toISOString(),
    });

    return user;
  }
}
