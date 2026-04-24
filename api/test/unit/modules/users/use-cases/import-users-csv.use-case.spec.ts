import { ForbiddenException } from '@nestjs/common';
import { ImportUsersCsvUseCase } from '@/modules/users/use-cases/import-users-csv.use-case';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ImportUsersCsvUseCase;
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
    useCase: new ImportUsersCsvUseCase(userRepository, hashProvider, messagingProvider),
    userRepository,
    hashProvider,
    messagingProvider,
  };
}

describe('ImportUsersCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        csvContent: 'fullName,email,profile,isActive\nJohn,john@b8one.com,CLIENT,true',
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can import users CSV'),
    );
  });

  it('imports new users and updates existing users', async () => {
    const { useCase, userRepository, hashProvider, messagingProvider } = createSut();

    const existingUser = makeUserEntity({
      id: 'existing-id',
      email: 'existing@b8one.com',
      profile: UserProfile.CLIENT,
    });

    userRepository.findByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);
    userRepository.createUser.mockResolvedValue(makeUserEntity({ id: 'new-id' }));
    userRepository.updateUser.mockResolvedValue(existingUser);
    hashProvider.hash.mockResolvedValue('hashed-password');

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'fullName,email,password,profile,isActive\n' +
        'New User,new@b8one.com,Secret@123,CLIENT,true\n' +
        'Existing User,existing@b8one.com,,ADMIN,false',
    });

    expect(output).toEqual({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    expect(userRepository.createUser).toHaveBeenCalledWith({
      fullName: 'New User',
      email: 'new@b8one.com',
      passwordHash: 'hashed-password',
      profile: UserProfile.CLIENT,
      isActive: true,
    });
    expect(userRepository.updateUser).toHaveBeenCalledWith('existing-id', {
      fullName: 'Existing User',
      profile: UserProfile.ADMIN,
      isActive: false,
    });
    expect(messagingProvider.publish).toHaveBeenCalledWith('users.csv.imported', {
      importedByUserId: 'user-id-1',
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
    });
  });

  it('skips invalid rows and keeps processing', async () => {
    const { useCase, userRepository } = createSut();

    userRepository.findByEmail.mockResolvedValue(null);

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'fullName,email,password,profile,isActive\n' +
        'Invalid User,invalid-email,Secret@123,CLIENT,true',
    });

    expect(output.processedRows).toBe(1);
    expect(output.skippedRows).toBe(1);
    expect(output.errors[0]).toEqual({
      row: 2,
      message: 'Row 2: "email" must be valid',
    });
  });
});
