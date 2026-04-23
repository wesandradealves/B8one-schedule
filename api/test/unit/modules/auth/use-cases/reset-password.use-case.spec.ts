import { UnauthorizedException } from '@nestjs/common';
import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import {
  makeAuthTwoFactorEntity,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ResetPasswordUseCase;
  userRepository: jest.Mocked<IUserRepository>;
  authRepository: jest.Mocked<IAuthRepository>;
  hashProvider: jest.Mocked<IHashProvider>;
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
  };

  const hashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const useCase = new ResetPasswordUseCase(
    userRepository,
    authRepository,
    hashProvider,
    messagingProvider,
  );

  return {
    useCase,
    userRepository,
    authRepository,
    hashProvider,
    messagingProvider,
  };
}

describe('ResetPasswordUseCase', () => {
  it('throws UnauthorizedException when user is not found', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'missing@b8one.com',
        code: '123456',
        newPassword: 'NewPassword@123',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired verification code'));
  });

  it('throws UnauthorizedException when recovery code is invalid or expired', async () => {
    const { useCase, userRepository, authRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ id: 'user-1', isActive: true }),
    );
    authRepository.findValidTwoFactorCode.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'user@b8one.com',
        code: '000000',
        newPassword: 'NewPassword@123',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired verification code'));
  });

  it('updates password, invalidates code and publishes event on success', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      hashProvider,
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
    hashProvider.hash.mockResolvedValue('new-password-hash');
    userRepository.updateUser.mockResolvedValue(
      makeUserEntity({
        id: 'user-1',
        email: 'admin@b8one.com',
        passwordHash: 'new-password-hash',
      }),
    );

    const output = await useCase.execute({
      email: 'admin@b8one.com',
      code: '123456',
      newPassword: 'NewPassword@123',
    });

    expect(authRepository.findValidTwoFactorCode).toHaveBeenCalledWith(
      'user-1',
      '123456',
      expect.any(Date),
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );
    expect(hashProvider.hash).toHaveBeenCalledWith('NewPassword@123');
    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', {
      passwordHash: 'new-password-hash',
    });
    expect(authRepository.invalidateTwoFactorCode).toHaveBeenCalledWith(
      '2fa-1',
      expect.any(Date),
    );
    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'auth.password-recovery.completed',
      {
        userId: 'user-1',
        email: 'admin@b8one.com',
        profile: UserProfile.ADMIN,
      },
    );

    expect(output).toEqual({
      message: 'Password updated successfully.',
    });
  });
});

