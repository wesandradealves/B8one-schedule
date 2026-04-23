import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface DeleteUserUseCaseInput {
  id: string;
  user: AuthenticatedUser;
}

export interface IDeleteUserUseCase {
  execute(input: DeleteUserUseCaseInput): Promise<void>;
}

export const IDeleteUserUseCase = Symbol('IDeleteUserUseCase');
