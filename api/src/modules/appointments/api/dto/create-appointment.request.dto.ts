import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentRequestDto {
  @ApiProperty({ format: 'uuid' })
  examId: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-05-10T15:30:00.000Z',
    description: 'ISO datetime in UTC',
  })
  scheduledAt: string;

  @ApiPropertyOptional({ maxLength: 500 })
  notes?: string;
}
