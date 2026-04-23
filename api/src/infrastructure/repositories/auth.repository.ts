import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
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

  async upsertTwoFactorCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    const existing = await this.repository
      .createQueryBuilder('twoFactor')
      .where('twoFactor.userId = :userId', { userId })
      .orderBy('twoFactor.createdAt', 'DESC')
      .getOne();

    if (!existing) {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(AuthTwoFactorEntity)
        .values({ userId, code, expiresAt, usedAt: null })
        .execute();
      return;
    }

    await this.repository
      .createQueryBuilder()
      .update(AuthTwoFactorEntity)
      .set({ code, expiresAt, usedAt: null })
      .where('id = :id', { id: existing.id })
      .execute();
  }

  async findValidTwoFactorCode(
    userId: string,
    code: string,
    now: Date,
  ): Promise<AuthTwoFactorEntity | null> {
    return this.repository
      .createQueryBuilder('twoFactor')
      .where('twoFactor.userId = :userId', { userId })
      .andWhere('twoFactor.code = :code', { code })
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
