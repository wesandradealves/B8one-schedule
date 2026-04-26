import { AuthEmailConfirmationEntity } from '@/domain/entities/auth.email-confirmation.entity';
import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { ILoginUseCase } from '@/domain/interfaces/use-cases/auth/login.use-case';
import { IVerifyTwoFactorUseCase } from '@/domain/interfaces/use-cases/auth/verify-two-factor.use-case';
import { IRequestPasswordRecoveryUseCase } from '@/domain/interfaces/use-cases/auth/request-password-recovery.use-case';
import { IVerifyPasswordRecoveryCodeUseCase } from '@/domain/interfaces/use-cases/auth/verify-password-recovery-code.use-case';
import { IResetPasswordUseCase } from '@/domain/interfaces/use-cases/auth/reset-password.use-case';
import { IVerifyEmailConfirmationUseCase } from '@/domain/interfaces/use-cases/auth/verify-email-confirmation.use-case';
import { AuthRepository } from '@/infrastructure/repositories/auth.repository';
import { JwtAuthModule } from '@/infrastructure/providers/auth/jwt/jwt-auth.module';
import { SmtpEmailModule } from '@/infrastructure/providers/email/smtp/smtp-email.module';
import { BullMqMessagingModule } from '@/infrastructure/providers/messaging/bullmq/bullmq.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthController } from './api/controllers/auth.controller';
import { LoginUseCase } from './use-cases/login.use-case';
import { VerifyTwoFactorUseCase } from './use-cases/verify-two-factor.use-case';
import { RequestPasswordRecoveryUseCase } from './use-cases/request-password-recovery.use-case';
import { VerifyPasswordRecoveryCodeUseCase } from './use-cases/verify-password-recovery-code.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { VerifyEmailConfirmationUseCase } from './use-cases/verify-email-confirmation.use-case';
import { HashModule } from '@/infrastructure/providers/hash/hash.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthTwoFactorEntity,
      AuthEmailConfirmationEntity,
    ]),
    UsersModule,
    HashModule,
    SmtpEmailModule,
    BullMqMessagingModule,
    JwtAuthModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },
    {
      provide: ILoginUseCase,
      useClass: LoginUseCase,
    },
    {
      provide: IVerifyTwoFactorUseCase,
      useClass: VerifyTwoFactorUseCase,
    },
    {
      provide: IRequestPasswordRecoveryUseCase,
      useClass: RequestPasswordRecoveryUseCase,
    },
    {
      provide: IVerifyPasswordRecoveryCodeUseCase,
      useClass: VerifyPasswordRecoveryCodeUseCase,
    },
    {
      provide: IResetPasswordUseCase,
      useClass: ResetPasswordUseCase,
    },
    {
      provide: IVerifyEmailConfirmationUseCase,
      useClass: VerifyEmailConfirmationUseCase,
    },
  ],
})
export class AuthModule {}
