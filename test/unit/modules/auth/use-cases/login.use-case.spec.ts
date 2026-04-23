import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase } from '@/modules/auth/use-cases/login.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { makeUserEntity } from '../../../helpers/factories';

type Sut = {
  useCase: LoginUseCase;
  userRepository: jest.Mocked<IUserRepository>;
  hashProvider: jest.Mocked<IHashProvider>;
  authRepository: jest.Mocked<IAuthRepository>;
  emailProvider: jest.Mocked<IEmailProvider>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
  configService: jest.Mocked<ConfigService>;
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

  const hashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const authRepository: jest.Mocked<IAuthRepository> = {
    upsertTwoFactorCode: jest.fn(),
    findValidTwoFactorCode: jest.fn(),
    invalidateTwoFactorCode: jest.fn(),
  };

  const emailProvider: jest.Mocked<IEmailProvider> = {
    send: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'auth.twoFactor.expirationMinutes') return 10;
      if (key === 'email.smtp.host') return 'smtp.ethereal.email';
      if (key === 'env') return 'development';
      return defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const useCase = new LoginUseCase(
    userRepository,
    hashProvider,
    authRepository,
    emailProvider,
    messagingProvider,
    configService,
  );

  return {
    useCase,
    userRepository,
    hashProvider,
    authRepository,
    emailProvider,
    messagingProvider,
    configService,
  };
}

describe('LoginUseCase', () => {
  it('throws UnauthorizedException when user is not found', async () => {
    const { useCase, userRepository, hashProvider } = createSut();
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@b8one.com', password: 'secret' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

    expect(hashProvider.compare).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    const { useCase, userRepository, hashProvider } = createSut();
    userRepository.findByEmail.mockResolvedValue(makeUserEntity({ isActive: true }));
    hashProvider.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@b8one.com', password: 'wrong' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('creates 2fa code, sends email and publishes event on success', async () => {
    const {
      useCase,
      userRepository,
      hashProvider,
      authRepository,
      emailProvider,
      messagingProvider,
    } = createSut();

    const user = makeUserEntity({
      id: 'user-1',
      email: 'admin@b8one.com',
      profile: UserProfile.ADMIN,
      isActive: true,
      passwordHash: 'hash',
    });

    userRepository.findByEmail.mockResolvedValue(user);
    hashProvider.compare.mockResolvedValue(true);

    const output = await useCase.execute({
      email: 'admin@b8one.com',
      password: 'Admin@123',
    });

    expect(output).toEqual({
      requiresTwoFactor: true,
      message: '2FA code sent to your e-mail.',
    });

    expect(authRepository.upsertTwoFactorCode).toHaveBeenCalledWith(
      'user-1',
      expect.stringMatching(/^\d{6}$/),
      expect.any(Date),
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@b8one.com',
        subject: 'Seu código de verificação (2FA)',
      }),
    );

    expect(messagingProvider.publish).toHaveBeenCalledWith('auth.two-factor.requested', {
      userId: 'user-1',
      email: 'admin@b8one.com',
      profile: UserProfile.ADMIN,
    });
  });

  it('does not fail when messaging publish fails', async () => {
    const { useCase, userRepository, hashProvider, messagingProvider } = createSut();

    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ id: 'user-1', email: 'client@b8one.com', isActive: true }),
    );
    hashProvider.compare.mockResolvedValue(true);
    messagingProvider.publish.mockRejectedValue(new Error('queue down'));

    await expect(
      useCase.execute({ email: 'client@b8one.com', password: 'Client@123' }),
    ).resolves.toEqual({
      requiresTwoFactor: true,
      message: '2FA code sent to your e-mail.',
    });
  });

  it('keeps login flow working when smtp host is not configured in non-production', async () => {
    const {
      useCase,
      userRepository,
      hashProvider,
      authRepository,
      emailProvider,
      configService,
    } = createSut();

    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ id: 'user-2', email: 'client2@b8one.com', isActive: true }),
    );
    hashProvider.compare.mockResolvedValue(true);

    configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === 'auth.twoFactor.expirationMinutes') return 10;
      if (key === 'email.smtp.host') return undefined;
      if (key === 'env') return 'development';
      return defaultValue as never;
    });

    await expect(
      useCase.execute({ email: 'client2@b8one.com', password: 'Client@123' }),
    ).resolves.toEqual({
      requiresTwoFactor: true,
      message: '2FA code sent to your e-mail.',
    });

    expect(authRepository.upsertTwoFactorCode).toHaveBeenCalled();
    expect(emailProvider.send).toHaveBeenCalled();
  });
});
