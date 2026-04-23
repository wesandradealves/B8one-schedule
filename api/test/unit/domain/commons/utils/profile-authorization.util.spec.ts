import { ForbiddenException } from '@nestjs/common';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  assertAdmin,
  assertOwner,
  assertOwnerOrAdmin,
  isAdmin,
} from '@/domain/commons/utils/profile-authorization.util';

const makeUser = (overrides: {
  id?: string;
  email?: string;
  profile?: UserProfile;
} = {}) => ({
  id: overrides.id ?? 'user-id-1',
  email: overrides.email ?? 'user@b8one.com',
  profile: overrides.profile ?? UserProfile.CLIENT,
});

describe('profile-authorization.util', () => {
  it('isAdmin returns true only for admin profile', () => {
    expect(isAdmin(makeUser({ profile: UserProfile.ADMIN }))).toBe(true);
    expect(isAdmin(makeUser({ profile: UserProfile.CLIENT }))).toBe(false);
  });

  it('assertAdmin throws for non-admin user', () => {
    expect(() => assertAdmin(makeUser({ profile: UserProfile.CLIENT }))).toThrow(
      ForbiddenException,
    );
  });

  it('assertOwnerOrAdmin allows owner and admin, blocks others', () => {
    expect(() =>
      assertOwnerOrAdmin(
        makeUser({ id: 'owner-id', profile: UserProfile.CLIENT }),
        'owner-id',
        'forbidden',
      ),
    ).not.toThrow();

    expect(() =>
      assertOwnerOrAdmin(
        makeUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
        'owner-id',
        'forbidden',
      ),
    ).not.toThrow();

    expect(() =>
      assertOwnerOrAdmin(
        makeUser({ id: 'other-id', profile: UserProfile.CLIENT }),
        'owner-id',
        'forbidden',
      ),
    ).toThrow(ForbiddenException);
  });

  it('assertOwner allows only owner', () => {
    expect(() =>
      assertOwner(makeUser({ id: 'owner-id' }), 'owner-id', 'forbidden'),
    ).not.toThrow();

    expect(() =>
      assertOwner(makeUser({ id: 'other-id' }), 'owner-id', 'forbidden'),
    ).toThrow(ForbiddenException);
  });
});
