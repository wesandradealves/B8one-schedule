import { UserEntity } from '@/domain/entities/user.entity';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { UserListSortBy } from '@/domain/commons/enums/user-list-sort-by.enum';

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
  isActive: boolean;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  passwordHash?: string;
  profile?: UserProfile;
  isActive?: boolean;
}

export interface UsersPaginationQuery extends PaginationQuery {
  sortBy?: UserListSortBy;
}

export interface IUserRepository {
  listAll(pagination: UsersPaginationQuery): Promise<PaginatedResult<UserEntity>>;
  existsByEmail(email: string, excludeUserId?: string): Promise<boolean>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  createUser(input: CreateUserInput): Promise<UserEntity>;
  updateUser(id: string, input: UpdateUserInput): Promise<UserEntity | null>;
  deleteUser(id: string): Promise<boolean>;
}

export const IUserRepository = Symbol('IUserRepository');
