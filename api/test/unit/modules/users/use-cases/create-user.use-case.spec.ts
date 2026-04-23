import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateUserUseCase } from '@/modules/users/use-cases/create-user.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: CreateUserUseCase;
  userRepository: jest.Mocked<IUserRepository>;
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

  const hashProvider: jest.Mocked<IHashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  const useCase = new CreateUserUseCase(userRepository, hashProvider, messagingProvider);

  return { useCase, userRepository, hashProvider, messagingProvider };
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

  it('hashes password, creates user and publishes event', async () => {
    const { useCase, userRepository, hashProvider, messagingProvider } = createSut();
    userRepository.existsByEmail.mockResolvedValue(false);
    hashProvider.hash.mockResolvedValue('hashed-password');
    userRepository.createUser.mockResolvedValue(
      makeUserEntity({
        id: 'new-user-id',
        email: 'new@b8one.com',
        profile: UserProfile.CLIENT,
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
      isActive: true,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('users.created', {
      userId: 'new-user-id',
      email: 'new@b8one.com',
      profile: UserProfile.CLIENT,
    });

    expect(output.id).toBe('new-user-id');
  });
});
