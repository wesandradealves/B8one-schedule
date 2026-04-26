export interface VerifyEmailConfirmationUseCaseInput {
  token: string;
}

export interface VerifyEmailConfirmationUseCaseOutput {
  message: string;
}

export interface IVerifyEmailConfirmationUseCase {
  execute(
    input: VerifyEmailConfirmationUseCaseInput,
  ): Promise<VerifyEmailConfirmationUseCaseOutput>;
}

export const IVerifyEmailConfirmationUseCase = Symbol(
  'IVerifyEmailConfirmationUseCase',
);
