import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordRecoveryRequestDto {
  @ApiProperty({ example: 'cliente@b8one.local' })
  email: string;
}

