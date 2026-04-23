import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRequestDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty({ example: 'cliente@b8one.com' })
  email: string;

  @ApiProperty({ minLength: 6 })
  password: string;

  @ApiProperty({ enum: UserProfile, enumName: 'UserProfile' })
  profile: UserProfile;

  @ApiPropertyOptional()
  isActive?: boolean;
}
