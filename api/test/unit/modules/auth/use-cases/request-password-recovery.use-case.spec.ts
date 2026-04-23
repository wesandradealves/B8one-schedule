import { ConfigService } from '@nestjs/config';
import { RequestPasswordRecoveryUseCase } from '@/modules/auth/use-cases/request-password-recovery.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IEmailProvider } from '@/domain/interfaces/providers/email.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthTwoFactorPurpose } from '@/domain/commons/enums/auth-two-factor-purpose.enum';
import { makeUserEntity } from '../../../helpers/factories';

type Sut = {
  useCase: RequestPasswordRecoveryUseCase;
  userRepository: jest.Mocked<IUserRepository>;
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

  const useCase = new RequestPasswordRecoveryUseCase(
    userRepository,
    authRepository,
    emailProvider,
    messagingProvider,
    configService,
  );

  return {
    useCase,
    userRepository,
    authRepository,
    emailProvider,
    messagingProvider,
    configService,
  };
}

describe('RequestPasswordRecoveryUseCase', () => {
  it('returns generic response and skips side effects when user is not found', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      emailProvider,
      messagingProvider,
    } = createSut();
    userRepository.findByEmail.mockResolvedValue(null);

    const output = await useCase.execute({ email: 'missing@b8one.com' });

    expect(output).toEqual({
      requiresTwoFactor: true,
      message: 'If the e-mail exists, a verification code was sent.',
    });

    expect(authRepository.upsertTwoFactorCode).not.toHaveBeenCalled();
    expect(emailProvider.send).not.toHaveBeenCalled();
    expect(messagingProvider.publish).not.toHaveBeenCalled();
  });

  it('returns generic response and skips side effects when user is inactive', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      emailProvider,
      messagingProvider,
    } = createSut();
    userRepository.findByEmail.mockResolvedValue(
      makeUserEntity({ isActive: false }),
    );

    const output = await useCase.execute({ email: 'inactive@b8one.com' });

    expect(output).toEqual({
      requiresTwoFactor: true,
      message: 'If the e-mail exists, a verification code was sent.',
    });

    expect(authRepository.upsertTwoFactorCode).not.toHaveBeenCalled();
    expect(emailProvider.send).not.toHaveBeenCalled();
    expect(messagingProvider.publish).not.toHaveBeenCalled();
  });

  it('creates password recovery code, sends email and publishes event on success', async () => {
    const {
      useCase,
      userRepository,
      authRepository,
      emailProvider,
      messagingProvider,
    } = createSut();

    const user = makeUserEntity({
      id: 'user-1',
      email: 'admin@b8one.com',
      profile: UserProfile.ADMIN,
      isActive: true,
    });
    userRepository.findByEmail.mockResolvedValue(user);

    const output = await useCase.execute({ email: 'admin@b8one.com' });

    expect(output).toEqual({
      requiresTwoFactor: true,
      message: 'If the e-mail exists, a verification code was sent.',
    });

    expect(authRepository.upsertTwoFactorCode).toHaveBeenCalledWith(
      'user-1',
      expect.stringMatching(/^\d{6}$/),
      expect.any(Date),
      AuthTwoFactorPurpose.PASSWORD_RECOVERY,
    );

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@b8one.com',
        subject: 'Seu código de recuperação de senha',
      }),
    );

    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'auth.password-recovery.requested',
      {
        userId: 'user-1',
        email: 'admin@b8one.com',
        profile: UserProfile.ADMIN,
      },
    );
  });
});

