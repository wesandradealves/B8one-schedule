import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestAppointmentChangeRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  examId?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-05-12T09:00:00.000Z',
    description: 'ISO datetime in UTC',
  })
  scheduledAt?: string;

  @ApiPropertyOptional({ type: String, maxLength: 500, nullable: true, example: 'Preferência por horário da manhã' })
  notes?: string | null;
}
