import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: true })
  requiresTwoFactor: true;

  @ApiProperty({ example: '2FA code sent to your e-mail.' })
  message: string;
}
