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

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3, 4, 5],
    description: 'Dias da semana disponíveis (0=Domingo ... 6=Sábado)',
  })
  availableWeekdays?: number[];

  @ApiPropertyOptional({ example: '07:00' })
  availableStartTime?: string;

  @ApiPropertyOptional({ example: '19:00' })
  availableEndTime?: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2026-05-01' })
  availableFromDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2026-12-31' })
  availableToDate?: string | null;

  @ApiPropertyOptional()
  isActive?: boolean;
}
