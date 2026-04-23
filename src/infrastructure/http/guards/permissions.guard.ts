import { PROFILE_PERMISSIONS } from '@/domain/commons/constants/profile-permissions.constant';
import { Permission } from '@/domain/commons/enums/permission.enum';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/infrastructure/http/decorators/permissions.decorator';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthenticated user');
    }

    const permissions = PROFILE_PERMISSIONS[user.profile] ?? [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
