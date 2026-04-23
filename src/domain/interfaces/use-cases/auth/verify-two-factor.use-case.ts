import { UserProfile } from '@/domain/commons/enums/user-profile.enum';

export interface VerifyTwoFactorUseCaseInput {
  email: string;
  code: string;
}

export interface VerifyTwoFactorUseCaseOutput {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  profile: UserProfile;
}

export interface IVerifyTwoFactorUseCase {
  execute(input: VerifyTwoFactorUseCaseInput): Promise<VerifyTwoFactorUseCaseOutput>;
}

export const IVerifyTwoFactorUseCase = Symbol('IVerifyTwoFactorUseCase');
