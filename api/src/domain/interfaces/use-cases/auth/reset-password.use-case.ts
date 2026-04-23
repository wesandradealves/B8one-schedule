export interface ResetPasswordUseCaseInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordUseCaseOutput {
  message: string;
}

export interface IResetPasswordUseCase {
  execute(input: ResetPasswordUseCaseInput): Promise<ResetPasswordUseCaseOutput>;
}

export const IResetPasswordUseCase = Symbol('IResetPasswordUseCase');

