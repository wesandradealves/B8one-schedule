import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  examId?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-05-10T15:30:00.000Z',
    description: 'ISO datetime in UTC',
  })
  scheduledAt?: string;

  @ApiPropertyOptional({ type: String, maxLength: 500, nullable: true, example: 'Ajuste manual aprovado pelo gestor' })
  notes?: string | null;

  @ApiPropertyOptional({ enum: AppointmentStatus, enumName: 'AppointmentStatus' })
  status?: AppointmentStatus;
}
