import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({ enum: UserProfile, enumName: 'UserProfile' })
  profile: UserProfile;
}
