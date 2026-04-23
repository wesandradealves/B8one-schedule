import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { ForbiddenException } from '@nestjs/common';

export function isAdmin(user: Pick<AuthenticatedUser, 'profile'>): boolean {
  return user.profile === UserProfile.ADMIN;
}

export function assertAdmin(
  user: AuthenticatedUser,
  message = 'Only admin users can perform this action',
): void {
  if (!isAdmin(user)) {
    throw new ForbiddenException(message);
  }
}

export function assertOwnerOrAdmin(
  user: AuthenticatedUser,
  ownerUserId: string,
  message: string,
): void {
  if (!isAdmin(user) && user.id !== ownerUserId) {
    throw new ForbiddenException(message);
  }
}

export function assertOwner(
  user: AuthenticatedUser,
  ownerUserId: string,
  message: string,
): void {
  if (user.id !== ownerUserId) {
    throw new ForbiddenException(message);
  }
}
