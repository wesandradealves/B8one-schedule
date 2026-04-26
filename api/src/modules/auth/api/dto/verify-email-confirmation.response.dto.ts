import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailConfirmationResponseDto {
  @ApiProperty({ example: 'E-mail confirmado com sucesso. Conta ativada.' })
  message: string;
}
