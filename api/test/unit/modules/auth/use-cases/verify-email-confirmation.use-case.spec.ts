import { BadRequestException } from '@nestjs/common';
import { VerifyEmailConfirmationUseCase } from '@/modules/auth/use-cases/verify-email-confirmation.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { hashEmailConfirmationToken } from '@/domain/commons/utils/email-confirmation-token.util';
import { makeUserEntity } from '../../../helpers/factories';

type Sut = {
  useCase: VerifyEmailConfirmationUseCase;
  authRepository: jest.Mocked<IAuthRepository>;
  userRepository: jest.Mocked<IUserRepository>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
};

function createSut(): Sut {
  const authRepository: jest.Mocked<IAuthRepository> = {
    upsertTwoFactorCode: jest.fn(),
    findValidTwoFactorCode: jest.fn(),
    invalidateTwoFactorCode: jest.fn(),
    upsertEmailConfirmationToken: jest.fn(),
    findValidEmailConfirmationToken: jest.fn(),
    invalidateEmailConfirmationToken: jest.fn(),
  };

  const userRepository: jest.Mocked<IUserRepository> = {
    listAll: jest.fn(),
    existsByEmail: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const useCase = new VerifyEmailConfirmationUseCase(
    authRepository,
    userRepository,
    messagingProvider,
  );

  return {
    useCase,
    authRepository,
    userRepository,
    messagingProvider,
  };
}

describe('VerifyEmailConfirmationUseCase', () => {
  it('throws when token is blank', async () => {
    const { useCase } = createSut();

    await expect(useCase.execute({ token: '   ' })).rejects.toThrow(
      new BadRequestException('Invalid or expired e-mail confirmation link'),
    );
  });

  it('throws when confirmation token is invalid or expired', async () => {
    const { useCase, authRepository } = createSut();
    authRepository.findValidEmailConfirmationToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'token-not-found' }),
    ).rejects.toThrow(
      new BadRequestException('Invalid or expired e-mail confirmation link'),
    );

    expect(authRepository.findValidEmailConfirmationToken).toHaveBeenCalledWith(
      hashEmailConfirmationToken('token-not-found'),
      expect.any(Date),
    );
  });

  it('throws when token exists but user does not exist', async () => {
    const { useCase, authRepository, userRepository } = createSut();

    authRepository.findValidEmailConfirmationToken.mockResolvedValue({
      id: 'confirmation-id',
      userId: 'missing-user-id',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: makeUserEntity({ id: 'missing-user-id' }),
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'valid-token' })).rejects.toThrow(
      new BadRequestException('Invalid or expired e-mail confirmation link'),
    );
  });

  it('activates user and invalidates token when successful', async () => {
    const { useCase, authRepository, userRepository, messagingProvider } = createSut();

    authRepository.findValidEmailConfirmationToken.mockResolvedValue({
      id: 'confirmation-id',
      userId: 'user-id-1',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: makeUserEntity({ id: 'user-id-1', email: 'client@b8one.com' }),
    });

    const user = makeUserEntity({
      id: 'user-id-1',
      email: 'client@b8one.com',
      isActive: false,
    });

    userRepository.findById.mockResolvedValue(user);
    userRepository.updateUser.mockResolvedValue({ ...user, isActive: true });

    const output = await useCase.execute({ token: 'valid-token' });

    expect(userRepository.updateUser).toHaveBeenCalledWith('user-id-1', {
      isActive: true,
    });
    expect(authRepository.invalidateEmailConfirmationToken).toHaveBeenCalledWith(
      'confirmation-id',
      expect.any(Date),
    );
    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'auth.email-confirmation.completed',
      {
        userId: 'user-id-1',
        email: 'client@b8one.com',
      },
    );
    expect(output).toEqual({
      message: 'E-mail confirmado com sucesso. Conta ativada.',
    });
  });
});
