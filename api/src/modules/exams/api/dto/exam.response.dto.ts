import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true, example: 'Análise geral do sangue' })
  description?: string | null;

  @ApiProperty({ example: 30 })
  durationMinutes: number;

  @ApiProperty({ example: 8900 })
  priceCents: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3, 4, 5] })
  availableWeekdays: number[];

  @ApiProperty({ example: '07:00' })
  availableStartTime: string;

  @ApiProperty({ example: '19:00' })
  availableEndTime: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2026-05-01' })
  availableFromDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2026-12-31' })
  availableToDate?: string | null;
}
