import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailConfirmationRequestDto {
  @ApiProperty({
    example: 'f9a3fce8e2b3f8f6f6ab91f9d49e5f3a2a3641f9b64d7f3e1112c58f3f4e8dcd',
    description: 'Token enviado por e-mail para confirmação de conta',
  })
  token: string;
}
