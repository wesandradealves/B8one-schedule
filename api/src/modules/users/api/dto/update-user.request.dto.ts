import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRequestDto {
  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'cliente@b8one.com' })
  email?: string;

  @ApiPropertyOptional({ minLength: 6 })
  password?: string;

  @ApiPropertyOptional({ enum: UserProfile, enumName: 'UserProfile' })
  profile?: UserProfile;

  @ApiPropertyOptional()
  isActive?: boolean;
}
