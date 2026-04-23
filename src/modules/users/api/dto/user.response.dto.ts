import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserProfile, enumName: 'UserProfile' })
  profile: UserProfile;

  @ApiProperty()
  isActive: boolean;
}
