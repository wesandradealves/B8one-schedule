import { ForbiddenException } from '@nestjs/common';
import { ExportUsersCsvUseCase } from '@/modules/users/use-cases/export-users-csv.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ExportUsersCsvUseCase;
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
    useCase: new ExportUsersCsvUseCase(userRepository, messagingProvider),
    userRepository,
    messagingProvider,
  };
}

describe('ExportUsersCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can export users CSV'),
    );
  });

  it('exports csv content and publishes event', async () => {
    const { useCase, userRepository, messagingProvider } = createSut();

    userRepository.listAll.mockResolvedValue({
      data: [makeUserEntity({ id: 'user-id-1', fullName: 'Admin User' })],
      page: 1,
      limit: 500,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
    });

    expect(output.fileName).toContain('users-');
    expect(output.csvContent).toContain(
      'id,fullName,email,profile,isActive,createdAt,updatedAt',
    );
    expect(output.csvContent).toContain('Admin User');
    expect(messagingProvider.publish).toHaveBeenCalledWith('users.csv.exported', {
      exportedByUserId: 'user-id-1',
      totalRows: 1,
      fileName: output.fileName,
    });
  });
});
