import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserUseCase } from '@/modules/users/use-cases/update-user.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: UpdateUserUseCase;
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

  return {
    useCase: new UpdateUserUseCase(userRepository, hashProvider, messagingProvider),
    userRepository,
    hashProvider,
    messagingProvider,
  };
}

describe('UpdateUserUseCase', () => {
  it('throws NotFoundException when target user is missing', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', user: makeAuthenticatedUser() }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('throws ForbiddenException when client updates another user', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'target-id' }));

    await expect(
      useCase.execute({
        id: 'target-id',
        user: makeAuthenticatedUser({ id: 'other-id', profile: UserProfile.CLIENT }),
        fullName: 'Changed Name',
      }),
    ).rejects.toThrow(new ForbiddenException('You can only update your own profile'));
  });

  it('throws ForbiddenException when client tries to update restricted fields', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'client-id' }));

    await expect(
      useCase.execute({
        id: 'client-id',
        user: makeAuthenticatedUser({ id: 'client-id', profile: UserProfile.CLIENT }),
        email: 'new@b8one.com',
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can update e-mail, profile or status'),
    );
  });

  it('throws BadRequestException when e-mail already exists', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'target-id' }));
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({
        id: 'target-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        email: 'duplicated@b8one.com',
      }),
    ).rejects.toThrow(new BadRequestException('E-mail already in use'));
  });

  it('updates user as admin and publishes event', async () => {
    const { useCase, userRepository, hashProvider, messagingProvider } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'target-id' }));
    userRepository.existsByEmail.mockResolvedValue(false);
    hashProvider.hash.mockResolvedValue('new-hash');
    userRepository.updateUser.mockResolvedValue(
      makeUserEntity({
        id: 'target-id',
        email: 'updated@b8one.com',
        profile: UserProfile.CLIENT,
      }),
    );

    const output = await useCase.execute({
      id: 'target-id',
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      fullName: 'Updated Name',
      email: 'updated@b8one.com',
      password: 'New@123',
      profile: UserProfile.CLIENT,
      isActive: true,
    });

    expect(hashProvider.hash).toHaveBeenCalledWith('New@123');
    expect(userRepository.updateUser).toHaveBeenCalledWith('target-id', {
      fullName: 'Updated Name',
      email: 'updated@b8one.com',
      passwordHash: 'new-hash',
      profile: UserProfile.CLIENT,
      isActive: true,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('users.updated', {
      userId: 'target-id',
      email: 'updated@b8one.com',
      profile: UserProfile.CLIENT,
    });

    expect(output.id).toBe('target-id');
  });

  it('updates own profile as client using only allowed fields', async () => {
    const { useCase, userRepository, hashProvider } = createSut();

    userRepository.findById.mockResolvedValue(
      makeUserEntity({ id: 'client-id', profile: UserProfile.CLIENT }),
    );
    hashProvider.hash.mockResolvedValue('client-new-hash');
    userRepository.updateUser.mockResolvedValue(
      makeUserEntity({ id: 'client-id', profile: UserProfile.CLIENT }),
    );

    await useCase.execute({
      id: 'client-id',
      user: makeAuthenticatedUser({ id: 'client-id', profile: UserProfile.CLIENT }),
      fullName: 'Client Updated',
      password: 'Client@456',
    });

    expect(userRepository.updateUser).toHaveBeenCalledWith('client-id', {
      fullName: 'Client Updated',
      email: undefined,
      passwordHash: 'client-new-hash',
      profile: undefined,
      isActive: undefined,
    });
  });

  it('throws NotFoundException when persistence update returns null', async () => {
    const { useCase, userRepository } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'target-id' }));
    userRepository.updateUser.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'target-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        fullName: 'Updated Name',
      }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });
});
