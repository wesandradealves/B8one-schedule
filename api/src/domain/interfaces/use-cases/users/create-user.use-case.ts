import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface CreateUserUseCaseInput {
  user: AuthenticatedUser;
  fullName: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export interface ICreateUserUseCase {
  execute(input: CreateUserUseCaseInput): Promise<UserEntity>;
}

export const ICreateUserUseCase = Symbol('ICreateUserUseCase');
