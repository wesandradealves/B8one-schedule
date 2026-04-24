import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: true })
  requiresTwoFactor: true;

  @ApiProperty({ example: '2FA code sent to your e-mail.' })
  message: string;

  @ApiProperty({ example: 600, description: 'Tempo de expiração do código 2FA em segundos.' })
  twoFactorExpiresInSeconds: number;
}
