import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from '@/infrastructure/http/decorators/profiles.decorator';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredProfiles = this.reflector.getAllAndOverride<UserProfile[]>(PROFILES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredProfiles || requiredProfiles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!user || !requiredProfiles.includes(user.profile)) {
      throw new ForbiddenException('User profile is not allowed to access this resource');
    }

    return true;
  }
}
