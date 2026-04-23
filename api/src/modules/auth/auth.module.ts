import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { ILoginUseCase } from '@/domain/interfaces/use-cases/auth/login.use-case';
import { IVerifyTwoFactorUseCase } from '@/domain/interfaces/use-cases/auth/verify-two-factor.use-case';
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
import { HashModule } from '@/infrastructure/providers/hash/hash.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthTwoFactorEntity]),
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
  ],
})
export class AuthModule {}
