import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from '@/modules/users/use-cases/get-user-by-id.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: GetUserByIdUseCase;
  userRepository: jest.Mocked<IUserRepository>;
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

  return {
    useCase: new GetUserByIdUseCase(userRepository),
    userRepository,
  };
}

describe('GetUserByIdUseCase', () => {
  it('throws NotFoundException when target user is missing', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', user: makeAuthenticatedUser() }),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('throws ForbiddenException when client requests another profile', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'target-user-id' }));

    await expect(
      useCase.execute({
        id: 'target-user-id',
        user: makeAuthenticatedUser({ id: 'different-user-id', profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new ForbiddenException('You can only access your own profile'));
  });

  it('returns target user for admin', async () => {
    const { useCase, userRepository } = createSut();
    const targetUser = makeUserEntity({ id: 'target-user-id' });
    userRepository.findById.mockResolvedValue(targetUser);

    await expect(
      useCase.execute({
        id: 'target-user-id',
        user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
      }),
    ).resolves.toBe(targetUser);
  });
});
