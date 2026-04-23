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
    private readonly repository: Repository<AuthTwoFactorEntity>,
  ) {}

  async upsertTwoFactorCode(
    userId: string,
    code: string,
    expiresAt: Date,
    purpose: AuthTwoFactorPurpose,
  ): Promise<void> {
    const existing = await this.repository
      .createQueryBuilder('twoFactor')
      .where('twoFactor.userId = :userId', { userId })
      .andWhere('twoFactor.purpose = :purpose', { purpose })
      .orderBy('twoFactor.createdAt', 'DESC')
      .getOne();

    if (!existing) {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(AuthTwoFactorEntity)
        .values({ userId, code, purpose, expiresAt, usedAt: null })
        .execute();
      return;
    }

    await this.repository
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
    return this.repository
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
    await this.repository
      .createQueryBuilder()
      .update(AuthTwoFactorEntity)
      .set({ usedAt })
      .where('id = :id', { id })
      .execute();
  }
}
