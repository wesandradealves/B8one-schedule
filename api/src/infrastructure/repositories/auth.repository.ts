import { AuthEmailConfirmationEntity } from '@/domain/entities/auth.email-confirmation.entity';
import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AuthTwoFactorEntity)
    private readonly twoFactorRepository: Repository<AuthTwoFactorEntity>,
    @InjectRepository(AuthEmailConfirmationEntity)
    private readonly emailConfirmationRepository: Repository<AuthEmailConfirmationEntity>,
  ) {}

  async upsertTwoFactorCode(
    userId: string,
    code: string,
    expiresAt: Date,
    purpose: AuthTwoFactorPurpose,
  ): Promise<void> {
    const existing = await this.twoFactorRepository
      .createQueryBuilder('twoFactor')
      .where('twoFactor.userId = :userId', { userId })
      .andWhere('twoFactor.purpose = :purpose', { purpose })
      .orderBy('twoFactor.createdAt', 'DESC')
      .getOne();

    if (!existing) {
      await this.twoFactorRepository
        .createQueryBuilder()
        .insert()
        .into(AuthTwoFactorEntity)
        .values({ userId, code, purpose, expiresAt, usedAt: null })
        .execute();
      return;
    }

    await this.twoFactorRepository
      .createQueryBuilder()
      .update(AuthTwoFactorEntity)
      .set({ code, purpose, expiresAt, usedAt: null })
      .where('id = :id', { id: existing.id })
      .execute();
  }

  async findValidTwoFactorCode(
    userId: string,
    code: string,
    now: Date,
    purpose: AuthTwoFactorPurpose,
  ): Promise<AuthTwoFactorEntity | null> {
    return this.twoFactorRepository
      .createQueryBuilder('twoFactor')
      .where('twoFactor.userId = :userId', { userId })
      .andWhere('twoFactor.code = :code', { code })
      .andWhere('twoFactor.purpose = :purpose', { purpose })
      .andWhere('twoFactor.usedAt IS NULL')
      .andWhere('twoFactor.expiresAt > :now', { now: now.toISOString() })
      .orderBy('twoFactor.createdAt', 'DESC')
      .getOne();
  }

  async invalidateTwoFactorCode(id: string, usedAt: Date): Promise<void> {
    await this.twoFactorRepository
      .createQueryBuilder()
      .update(AuthTwoFactorEntity)
      .set({ usedAt })
      .where('id = :id', { id })
      .execute();
  }

  async upsertEmailConfirmationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const existing = await this.emailConfirmationRepository
      .createQueryBuilder('confirmation')
      .where('confirmation.userId = :userId', { userId })
      .orderBy('confirmation.createdAt', 'DESC')
      .getOne();

    if (!existing) {
      await this.emailConfirmationRepository
        .createQueryBuilder()
        .insert()
        .into(AuthEmailConfirmationEntity)
        .values({ userId, tokenHash, expiresAt, usedAt: null })
        .execute();
      return;
    }

    await this.emailConfirmationRepository
      .createQueryBuilder()
      .update(AuthEmailConfirmationEntity)
      .set({ tokenHash, expiresAt, usedAt: null })
      .where('id = :id', { id: existing.id })
      .execute();
  }

  async findValidEmailConfirmationToken(
    tokenHash: string,
    now: Date,
  ): Promise<AuthEmailConfirmationEntity | null> {
    return this.emailConfirmationRepository
      .createQueryBuilder('confirmation')
      .where('confirmation.tokenHash = :tokenHash', { tokenHash })
      .andWhere('confirmation.usedAt IS NULL')
      .andWhere('confirmation.expiresAt > :now', { now: now.toISOString() })
      .orderBy('confirmation.createdAt', 'DESC')
      .getOne();
  }

  async invalidateEmailConfirmationToken(id: string, usedAt: Date): Promise<void> {
    await this.emailConfirmationRepository
      .createQueryBuilder()
      .update(AuthEmailConfirmationEntity)
      .set({ usedAt })
      .where('id = :id', { id })
      .execute();
  }
}
