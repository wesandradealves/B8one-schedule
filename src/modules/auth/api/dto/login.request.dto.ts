import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'cliente@b8one.local' })
  email: string;

  @ApiProperty({ example: 'Client@123' })
  password: string;
}
