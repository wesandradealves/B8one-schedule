import { UserEntity } from '@/domain/entities/user.entity';
import {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '@/domain/interfaces/repositories/user.repository';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async listAll(pagination: PaginationQuery): Promise<PaginatedResult<UserEntity>> {
    const [data, total] = await this.repository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    return {
      data,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
    };
  }

  async existsByEmail(email: string, excludeUserId?: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id <> :excludeUserId', { excludeUserId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    const insertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        fullName: input.fullName,
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        profile: input.profile,
        isActive: input.isActive,
      })
      .returning('id')
      .execute();

    const userId = String(insertResult.identifiers[0]?.id);
    return this.findByIdOrFail(userId);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserEntity | null> {
    const payload: Partial<UserEntity> = {};

    if (input.fullName !== undefined) {
      payload.fullName = input.fullName;
    }
    if (input.email !== undefined) {
      payload.email = input.email.trim().toLowerCase();
    }
    if (input.passwordHash !== undefined) {
      payload.passwordHash = input.passwordHash;
    }
    if (input.profile !== undefined) {
      payload.profile = input.profile;
    }
    if (input.isActive !== undefined) {
      payload.isActive = input.isActive;
    }

    if (Object.keys(payload).length === 0) {
      return this.findById(id);
    }

    await this.repository
      .createQueryBuilder()
      .update(UserEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    return this.findById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ isActive: false })
      .where('id = :id', { id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  private async findByIdOrFail(id: string): Promise<UserEntity> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOneOrFail();
  }
}
