import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'cliente@b8one.local' })
  email: string;

  @ApiProperty({ example: '123456' })
  code: string;

  @ApiProperty({ example: 'NewPassword@123' })
  newPassword: string;
}

