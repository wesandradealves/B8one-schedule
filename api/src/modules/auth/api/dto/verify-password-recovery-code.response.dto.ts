import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordRecoveryCodeResponseDto {
  @ApiProperty({ example: true })
  verified: true;

  @ApiProperty({ example: 'Verification code validated successfully.' })
  message: string;
}

