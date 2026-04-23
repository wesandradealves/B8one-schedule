import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface UpdateUserUseCaseInput {
  id: string;
  user: AuthenticatedUser;
  fullName?: string;
  email?: string;
  password?: string;
  profile?: UserProfile;
  isActive?: boolean;
}

export interface IUpdateUserUseCase {
  execute(input: UpdateUserUseCaseInput): Promise<UserEntity>;
}

export const IUpdateUserUseCase = Symbol('IUpdateUserUseCase');
