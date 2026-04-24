import { UserEntity } from '@/domain/entities/user.entity';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';
import { UserListSortBy } from '@/domain/commons/enums/user-list-sort-by.enum';
import {
  CreateUserInput,
  IUserRepository,
  UsersPaginationQuery,
  UpdateUserInput,
} from '@/domain/interfaces/repositories/user.repository';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class UserRepository implements IUserRepository {
  private static readonly DUPLICATE_KEY_ERROR_CODE = '23505';
  private static readonly EMAIL_UNIQUE_CONSTRAINTS = new Set([
    'UQ_users_email',
    'UQ_users_email_lower',
  ]);

  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async listAll(
    pagination: UsersPaginationQuery,
  ): Promise<PaginatedResult<UserEntity>> {
    const sortOrder = pagination.sortOrder ?? SortOrder.DESC;
    const sortBy = pagination.sortBy ?? UserListSortBy.CREATED_AT;

    const queryBuilder = this.repository.createQueryBuilder('user');

    if (sortBy === UserListSortBy.PROFILE) {
      queryBuilder
        .orderBy('user.profile', sortOrder)
        .addOrderBy('user.createdAt', sortOrder)
        .addOrderBy('user.id', sortOrder);
    } else if (sortBy === UserListSortBy.IS_ACTIVE) {
      queryBuilder
        .orderBy('user.isActive', sortOrder)
        .addOrderBy('user.createdAt', sortOrder)
        .addOrderBy('user.id', sortOrder);
    } else {
      queryBuilder
        .orderBy('user.createdAt', sortOrder)
        .addOrderBy('user.id', sortOrder);
    }

    const [data, total] = await queryBuilder
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
    let insertResult: { identifiers: Array<{ id?: string }> };

    try {
      insertResult = await this.repository
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
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new BadRequestException('E-mail already in use');
      }

      throw error;
    }

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

    try {
      await this.repository
        .createQueryBuilder()
        .update(UserEntity)
        .set(payload)
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new BadRequestException('E-mail already in use');
      }

      throw error;
    }

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

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string; constraint?: string };
    }).driverError;

    return (
      driverError?.code === UserRepository.DUPLICATE_KEY_ERROR_CODE &&
      UserRepository.EMAIL_UNIQUE_CONSTRAINTS.has(driverError.constraint ?? '')
    );
  }
}
