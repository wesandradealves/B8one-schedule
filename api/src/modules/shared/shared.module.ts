import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '@/infrastructure/http/guards/jwt-auth.guard';
import { ProfileGuard } from '@/infrastructure/http/guards/profile.guard';
import { PermissionsGuard } from '@/infrastructure/http/guards/permissions.guard';

@Module({
  providers: [JwtAuthGuard, ProfileGuard, PermissionsGuard],
  exports: [JwtAuthGuard, ProfileGuard, PermissionsGuard],
})
export class SharedModule {}
