import { ListUsersUseCase } from '@/modules/users/use-cases/list-users.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ListUsersUseCase;
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
    useCase: new ListUsersUseCase(userRepository),
    userRepository,
  };
}

describe('ListUsersUseCase', () => {
  it('returns paginated listAll for admin', async () => {
    const { useCase, userRepository } = createSut();
    const pagination = { page: 1, limit: 10 };

    userRepository.listAll.mockResolvedValue({
      data: [makeUserEntity({ id: 'u1' })],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      pagination,
    );

    expect(userRepository.listAll).toHaveBeenCalledWith(pagination);
    expect(output.total).toBe(1);
  });

  it('returns only own user for client on first page', async () => {
    const { useCase, userRepository } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'client-id' }));

    const output = await useCase.execute(
      makeAuthenticatedUser({ id: 'client-id', profile: UserProfile.CLIENT }),
      { page: 1, limit: 10 },
    );

    expect(userRepository.listAll).not.toHaveBeenCalled();
    expect(output.data).toHaveLength(1);
    expect(output.total).toBe(1);
  });

  it('returns empty data for client when page offset excludes own user', async () => {
    const { useCase, userRepository } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'client-id' }));

    const output = await useCase.execute(
      makeAuthenticatedUser({ id: 'client-id', profile: UserProfile.CLIENT }),
      { page: 2, limit: 10 },
    );

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(1);
    expect(output.totalPages).toBe(1);
  });

  it('returns empty page metadata when client user is not found', async () => {
    const { useCase, userRepository } = createSut();
    userRepository.findById.mockResolvedValue(null);

    const output = await useCase.execute(
      makeAuthenticatedUser({ id: 'missing-client-id', profile: UserProfile.CLIENT }),
      { page: 1, limit: 10 },
    );

    expect(output.data).toEqual([]);
    expect(output.total).toBe(0);
    expect(output.totalPages).toBe(0);
  });
});
