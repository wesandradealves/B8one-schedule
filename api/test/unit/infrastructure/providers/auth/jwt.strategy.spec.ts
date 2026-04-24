import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { UserEntity } from '@/domain/entities/user.entity';
import { JwtStrategy } from '@/infrastructure/providers/auth/jwt/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

type QueryBuilderMock = {
  where: jest.Mock;
  getOne: jest.Mock;
};

const createUser = (overrides: Partial<UserEntity> = {}): UserEntity => {
  return {
    id: overrides.id ?? 'user-id-1',
    fullName: overrides.fullName ?? 'User Test',
    email: overrides.email ?? 'user@test.com',
    passwordHash: overrides.passwordHash ?? 'hash',
    profile: overrides.profile ?? UserProfile.CLIENT,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    twoFactorCodes: [],
    appointments: [],
  };
};

const createSut = () => {
  const configService = {
    get: jest.fn().mockReturnValue('jwt-secret'),
  } as unknown as ConfigService;

  const queryBuilder: QueryBuilderMock = {
    where: jest.fn(),
    getOne: jest.fn(),
  };
  queryBuilder.where.mockReturnValue(queryBuilder);

  const userRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  } as unknown as Repository<UserEntity>;

  const strategy = new JwtStrategy(configService, userRepository);

  return {
    strategy,
    queryBuilder,
  };
};

describe('JwtStrategy', () => {
  it('throws when payload is invalid', async () => {
    const { strategy } = createSut();

    await expect(
      strategy.validate({
        sub: '',
        email: 'user@test.com',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid token payload'));
  });

  it('throws when user is not found', async () => {
    const { strategy, queryBuilder } = createSut();
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'user-id-1',
        email: 'user@test.com',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new UnauthorizedException('User is inactive or no longer available'));
  });

  it('throws when user is inactive', async () => {
    const { strategy, queryBuilder } = createSut();
    queryBuilder.getOne.mockResolvedValue(createUser({ isActive: false }));

    await expect(
      strategy.validate({
        sub: 'user-id-1',
        email: 'user@test.com',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new UnauthorizedException('User is inactive or no longer available'));
  });

  it('throws when user profile differs from token', async () => {
    const { strategy, queryBuilder } = createSut();
    queryBuilder.getOne.mockResolvedValue(createUser({ profile: UserProfile.ADMIN }));

    await expect(
      strategy.validate({
        sub: 'user-id-1',
        email: 'user@test.com',
        profile: UserProfile.CLIENT,
      }),
    ).rejects.toThrow(new UnauthorizedException('Token is no longer valid'));
  });

  it('returns authenticated user when payload matches current user state', async () => {
    const { strategy, queryBuilder } = createSut();
    queryBuilder.getOne.mockResolvedValue(
      createUser({
        id: 'user-id-1',
        email: 'USER@Test.com',
        profile: UserProfile.CLIENT,
      }),
    );

    await expect(
      strategy.validate({
        sub: 'user-id-1',
        email: 'user@test.com',
        profile: UserProfile.CLIENT,
      }),
    ).resolves.toEqual({
      id: 'user-id-1',
      email: 'user@test.com',
      profile: UserProfile.CLIENT,
    });
  });
});
