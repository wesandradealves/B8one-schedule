import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordRecoveryCodeRequestDto {
  @ApiProperty({ example: 'cliente@b8one.local' })
  email: string;

  @ApiProperty({ example: '123456' })
  code: string;
}

