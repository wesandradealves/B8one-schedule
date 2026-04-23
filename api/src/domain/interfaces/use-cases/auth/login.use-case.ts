export interface LoginUseCaseInput {
  email: string;
  password: string;
}

export interface LoginUseCaseOutput {
  requiresTwoFactor: true;
  message: string;
}

export interface ILoginUseCase {
  execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput>;
}

export const ILoginUseCase = Symbol('ILoginUseCase');
