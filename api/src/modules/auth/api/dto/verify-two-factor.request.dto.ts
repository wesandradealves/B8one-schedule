import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorRequestDto {
  @ApiProperty({ example: 'cliente@b8one.local' })
  email: string;

  @ApiProperty({ example: '123456' })
  code: string;
}
