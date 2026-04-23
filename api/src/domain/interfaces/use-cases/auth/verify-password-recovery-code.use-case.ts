export interface VerifyPasswordRecoveryCodeUseCaseInput {
  email: string;
  code: string;
}

export interface VerifyPasswordRecoveryCodeUseCaseOutput {
  verified: true;
  message: string;
}

export interface IVerifyPasswordRecoveryCodeUseCase {
  execute(
    input: VerifyPasswordRecoveryCodeUseCaseInput,
  ): Promise<VerifyPasswordRecoveryCodeUseCaseOutput>;
}

export const IVerifyPasswordRecoveryCodeUseCase = Symbol(
  'IVerifyPasswordRecoveryCodeUseCase',
);

