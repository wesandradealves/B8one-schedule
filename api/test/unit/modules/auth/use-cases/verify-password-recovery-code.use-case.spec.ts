import { UnauthorizedException } from '@nestjs/common';
import { VerifyPasswordRecoveryCodeUseCase } from '@/modules/auth/use-cases/verify-password-recovery-code.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import {
  makeAuthTwoFactorEntity,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: VerifyPasswordRecoveryCodeUseCase;
  userRepository: jest.Mocked<IUserRepository>;
  authRepository: jest.Mocked<IAuthRepository>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
};

function createSut(): Sut {
  const userRepository: jest.Mocked<IUserRepository> = {
    listAll: jest.fn(),
    existsByEmail: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const authRepository: jest.Mocked<IAuthRepository> = {
    upsertTwoFactorCode: jest.fn(),
    findValidTwoFactorCode: jest.fn(),
    invalidateTwoFactorCode: jest.fn(),
    upsertEmailConfirmationToken: jest.fn(),
    findValidEmailConfirmationToken: jest.fn(),
    invalidateEmailConfirmationToken: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const useCase = new VerifyPasswordRecoveryCodeUseCase(
    userRepository,
    authRepository,
    messagingProvider,
  );

  return {
    useCase,
    userRepository,
    authRepository,
    messagingProvider,
  };
}

describe('VerifyPasswordRecoveryCodeUseCase', () => {
  it('throws UnauthorizedException when user is not found', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@b8one.com', code: '123456' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired verification code'));
  });

  it('throws UnauthorizedException when code is invalid or expired', async () => {
    const { useCase, userRepository, authRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ id: 'user-1', isActive: true }),
    );
    authRepository.findValidTwoFactorCode.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'user@b8one.com', code: '000000' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired verification code'));
  });

  it('validates code and publishes event on success', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      messagingProvider,
    } = createSut();

    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({
        id: 'user-1',
        email: 'admin@b8one.com',
        profile: UserProfile.ADMIN,
        isActive: true,
      }),
    );
    authRepository.findValidTwoFactorCode.mockResolvedValue(
      makeAuthTwoFactorEntity({
        id: '2fa-1',
        userId: 'user-1',
        purpose: AuthTwoFactorPurpose.PASSWORD_RECOVERY,
      }),
    );

    const output = await useCase.execute({
      email: 'admin@b8one.com',
      code: '123456',
    });

    expect(authRepository.findValidTwoFactorCode).toHaveBeenCalledWith(
      'user-1',
      '123456',
      expect.any(Date),
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );

    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'auth.password-recovery.verified',
      {
        userId: 'user-1',
        email: 'admin@b8one.com',
        profile: UserProfile.ADMIN,
      },
    );

    expect(output).toEqual({
      verified: true,
      message: 'Verification code validated successfully.',
    });
  });
});
