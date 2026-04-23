import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';

export interface IAuthRepository {
  upsertTwoFactorCode(userId: string, code: string, expiresAt: Date): Promise<void>;
  findValidTwoFactorCode(userId: string, code: string, now: Date): Promise<AuthTwoFactorEntity | null>;
  invalidateTwoFactorCode(id: string, usedAt: Date): Promise<void>;
}

export const IAuthRepository = Symbol('IAuthRepository');
