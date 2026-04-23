import { ApiProperty } from '@nestjs/swagger';

export class ExamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true, example: 'Análise geral do sangue' })
  description?: string | null;

  @ApiProperty({ example: 30 })
  durationMinutes: number;

  @ApiProperty({ example: 8900 })
  priceCents: number;
}
