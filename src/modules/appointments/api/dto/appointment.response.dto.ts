import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  examId: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  examName: string;

  @ApiProperty({ enum: AppointmentStatus, enumName: 'AppointmentStatus' })
  status: AppointmentStatus;

  @ApiProperty({ format: 'date-time' })
  scheduledAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Paciente prefere jejum de 8h' })
  notes?: string | null;

  @ApiProperty({ enum: AppointmentChangeStatus, enumName: 'AppointmentChangeStatus' })
  changeStatus: AppointmentChangeStatus;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  requestedExamId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  requestedExamName?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  requestedScheduledAt?: Date | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  requestedNotes?: string | null;

  @ApiPropertyOptional()
  userFullName?: string;

  @ApiPropertyOptional()
  userEmail?: string;
}
