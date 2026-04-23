import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExamRequestDto {
  @ApiPropertyOptional({ example: 'Hemograma Completo' })
  name?: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Análise geral do sangue' })
  description?: string | null;

  @ApiPropertyOptional({ example: 20 })
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 4500 })
  priceCents?: number;

  @ApiPropertyOptional()
  isActive?: boolean;
}
