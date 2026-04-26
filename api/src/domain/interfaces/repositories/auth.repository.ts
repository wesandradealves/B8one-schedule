import { AuthEmailConfirmationEntity } from '@/domain/entities/auth.email-confirmation.entity';
import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';

export interface IAuthRepository {
  upsertTwoFactorCode(
    userId: string,
    code: string,
    expiresAt: Date,
    purpose: AuthTwoFactorPurpose,
  ): Promise<void>;
  findValidTwoFactorCode(
    userId: string,
    code: string,
    now: Date,
    purpose: AuthTwoFactorPurpose,
  ): Promise<AuthTwoFactorEntity | null>;
  invalidateTwoFactorCode(id: string, usedAt: Date): Promise<void>;
  upsertEmailConfirmationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  findValidEmailConfirmationToken(
    tokenHash: string,
    now: Date,
  ): Promise<AuthEmailConfirmationEntity | null>;
  invalidateEmailConfirmationToken(id: string, usedAt: Date): Promise<void>;
}

export const IAuthRepository = Symbol('IAuthRepository');
