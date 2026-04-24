import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordRecoveryResponseDto {
  @ApiProperty({ example: true })
  requiresTwoFactor: true;

  @ApiProperty({ example: 'If the e-mail exists, a verification code was sent.' })
  message: string;

  @ApiProperty({ example: 600, description: 'Tempo de expiração do código 2FA em segundos.' })
  twoFactorExpiresInSeconds: number;
}
