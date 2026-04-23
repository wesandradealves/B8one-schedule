import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface DeleteExamUseCaseInput {
  id: string;
  user: AuthenticatedUser;
}

export interface IDeleteExamUseCase {
  execute(input: DeleteExamUseCaseInput): Promise<void>;
}

export const IDeleteExamUseCase = Symbol('IDeleteExamUseCase');
