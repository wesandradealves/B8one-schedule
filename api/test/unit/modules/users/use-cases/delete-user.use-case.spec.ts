import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from '@/modules/users/use-cases/delete-user.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { makeAuthenticatedUser } from '../../../helpers/factories';

type Sut = {
  useCase: DeleteUserUseCase;
  userRepository: jest.Mocked<IUserRepository>;
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

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new DeleteUserUseCase(userRepository, messagingProvider),
    userRepository,
    messagingProvider,
  };
}

describe('DeleteUserUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, userRepository } = createSut();

    await expect(
      useCase.execute({ id: 'user-id-1', user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }) }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can delete users'));

    expect(userRepository.deleteUser).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when user does not exist', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.deleteUser.mockResolvedValue(false);

    await expect(
      useCase.execute({ id: 'missing-id', user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }) }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('deletes user and publishes event', async () => {
    const { useCase, userRepository, messagingProvider } = createSut();
    userRepository.deleteUser.mockResolvedValue(true);

    await expect(
      useCase.execute({ id: 'user-id-1', user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }) }),
    ).resolves.toBeUndefined();

    expect(messagingProvider.publish).toHaveBeenCalledWith('users.deleted', {
      userId: 'user-id-1',
    });
  });
});
