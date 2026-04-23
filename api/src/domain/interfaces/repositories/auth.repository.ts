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
}

export const IAuthRepository = Symbol('IAuthRepository');
