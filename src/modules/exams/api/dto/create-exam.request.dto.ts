import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamRequestDto {
  @ApiProperty({ example: 'Hemograma Completo' })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Análise geral do sangue' })
  description?: string | null;

  @ApiProperty({ example: 20 })
  durationMinutes: number;

  @ApiProperty({ example: 4500 })
  priceCents: number;
}
