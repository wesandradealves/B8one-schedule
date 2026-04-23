import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordRecoveryResponseDto {
  @ApiProperty({ example: true })
  requiresTwoFactor: true;

  @ApiProperty({ example: 'If the e-mail exists, a verification code was sent.' })
  message: string;
}

