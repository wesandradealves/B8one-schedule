import { UserEntity } from '@/domain/entities/user.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface GetUserByIdUseCaseInput {
  id: string;
  user: AuthenticatedUser;
}

export interface IGetUserByIdUseCase {
  execute(input: GetUserByIdUseCaseInput): Promise<UserEntity>;
}

export const IGetUserByIdUseCase = Symbol('IGetUserByIdUseCase');
