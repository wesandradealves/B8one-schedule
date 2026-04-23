import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifyTwoFactorUseCase } from '@/modules/auth/use-cases/verify-two-factor.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IJwtProvider } from '@/domain/interfaces/providers/jwt.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthTwoFactorEntity,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: VerifyTwoFactorUseCase;
  userRepository: jest.Mocked<IUserRepository>;
  authRepository: jest.Mocked<IAuthRepository>;
  jwtProvider: jest.Mocked<IJwtProvider>;
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

  const authRepository: jest.Mocked<IAuthRepository> = {
    upsertTwoFactorCode: jest.fn(),
    findValidTwoFactorCode: jest.fn(),
    invalidateTwoFactorCode: jest.fn(),
  };

  const jwtProvider: jest.Mocked<IJwtProvider> = {
    signAccessToken: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'auth.jwt.expiresInSeconds') return 3600;
      return defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const useCase = new VerifyTwoFactorUseCase(
    userRepository,
    authRepository,
    jwtProvider,
    messagingProvider,
    configService,
  );

  return {
    useCase,
    userRepository,
    authRepository,
    jwtProvider,
    messagingProvider,
    configService,
  };
}

describe('VerifyTwoFactorUseCase', () => {
  it('throws UnauthorizedException when user is not found', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@b8one.com', code: '123456' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('throws UnauthorizedException when code is invalid or expired', async () => {
    const { useCase, userRepository, authRepository } = createSut();
    userRepository.findByEmail.mockResolvedValue(makeUserEntity({ id: 'user-1', isActive: true }));
    authRepository.findValidTwoFactorCode.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'user@b8one.com', code: '000000' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired verification code'));
  });

  it('invalidates code, issues token and publishes event on success', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      jwtProvider,
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
      makeAuthTwoFactorEntity({ id: '2fa-1', userId: 'user-1', code: '123456' }),
    );
    jwtProvider.signAccessToken.mockResolvedValue('jwt-token');

    const output = await useCase.execute({ email: 'admin@b8one.com', code: '123456' });

    expect(authRepository.invalidateTwoFactorCode).toHaveBeenCalledWith('2fa-1', expect.any(Date));
    expect(jwtProvider.signAccessToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'admin@b8one.com',
      profile: UserProfile.ADMIN,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('auth.login.success', {
      userId: 'user-1',
      email: 'admin@b8one.com',
      profile: UserProfile.ADMIN,
    });

    expect(output).toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      profile: UserProfile.ADMIN,
    });
  });

  it('does not fail when messaging publish fails', async () => {
    const { useCase, userRepository, authRepository, jwtProvider, messagingProvider } = createSut();

    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ id: 'user-1', email: 'client@b8one.com', profile: UserProfile.CLIENT, isActive: true }),
    );
    authRepository.findValidTwoFactorCode.mockResolvedValue(
      makeAuthTwoFactorEntity({ id: '2fa-1', userId: 'user-1' }),
    );
    jwtProvider.signAccessToken.mockResolvedValue('jwt-token');
    messagingProvider.publish.mockRejectedValue(new Error('queue down'));

    await expect(
      useCase.execute({ email: 'client@b8one.com', code: '123456' }),
    ).resolves.toEqual(
      expect.objectContaining({ accessToken: 'jwt-token', tokenType: 'Bearer' }),
    );
  });
});
