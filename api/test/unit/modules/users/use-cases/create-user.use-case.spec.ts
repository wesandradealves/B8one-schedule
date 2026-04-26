import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserUseCase } from '@/modules/users/use-cases/create-user.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: CreateUserUseCase;
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
    upsertEmailConfirmationToken: jest.fn(),
    findValidEmailConfirmationToken: jest.fn(),
    invalidateEmailConfirmationToken: jest.fn(),
  };

  const emailProvider: jest.Mocked<IEmailProvider> = {
    send: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'auth.emailConfirmation.expirationHours') return 48;
      if (key === 'application.frontendBaseUrl') return 'http://localhost:3001';
      if (key === 'email.smtp.host') return 'smtp.ethereal.email';
      if (key === 'env') return 'development';
      return defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const useCase = new CreateUserUseCase(
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

describe('CreateUserUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, userRepository } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        fullName: 'User',
        email: 'user@b8one.com',
        password: 'Client@123',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can create users'));

    expect(userRepository.existsByEmail).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when e-mail already exists', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        fullName: 'User',
        email: 'duplicated@b8one.com',
        password: 'Client@123',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new BadRequestException('E-mail already in use'));
  });

  it('creates inactive user and sends e-mail confirmation link', async () => {
    const {
      useCase,
      userRepository,
      hashProvider,
      authRepository,
      emailProvider,
      messagingProvider,
    } = createSut();

    userRepository.existsByEmail.mockResolvedValue(false);
    hashProvider.hash.mockResolvedValue('hashed-password');
    userRepository.createUser.mockResolvedValue(
      makeUserEntity({
        id: 'new-user-id',
        fullName: 'New User',
        email: 'new@b8one.com',
        profile: UserProfile.CLIENT,
        isActive: false,
      }),
    );

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      fullName: 'New User',
      email: 'new@b8one.com',
      password: 'Client@123',
      profile: UserProfile.CLIENT,
    });

    expect(hashProvider.hash).toHaveBeenCalledWith('Client@123');
    expect(userRepository.createUser).toHaveBeenCalledWith({
      fullName: 'New User',
      email: 'new@b8one.com',
      passwordHash: 'hashed-password',
      profile: UserProfile.CLIENT,
      isActive: false,
    });

    expect(authRepository.upsertEmailConfirmationToken).toHaveBeenCalledWith(
      'new-user-id',
      expect.any(String),
      expect.any(Date),
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@b8one.com',
        subject: 'Confirme seu e-mail para ativar sua conta',
        html: expect.stringContaining('/confirm-email?token='),
      }),
    );

    expect(messagingProvider.publish).toHaveBeenCalledWith('users.created', {
      userId: 'new-user-id',
      email: 'new@b8one.com',
      profile: UserProfile.CLIENT,
      isActive: false,
    });

    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'auth.email-confirmation.requested',
      {
        userId: 'new-user-id',
        email: 'new@b8one.com',
        expiresAt: expect.any(String),
      },
    );

    expect(output.id).toBe('new-user-id');
    expect(output.isActive).toBe(false);
  });
});
