export interface RequestPasswordRecoveryUseCaseInput {
  email: string;
}

export interface RequestPasswordRecoveryUseCaseOutput {
  requiresTwoFactor: true;
  message: string;
  twoFactorExpiresInSeconds: number;
}

export interface IRequestPasswordRecoveryUseCase {
  execute(
    input: RequestPasswordRecoveryUseCaseInput,
  ): Promise<RequestPasswordRecoveryUseCaseOutput>;
}

export const IRequestPasswordRecoveryUseCase = Symbol(
  'IRequestPasswordRecoveryUseCase',
);
