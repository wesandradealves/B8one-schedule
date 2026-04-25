import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentAvailabilityResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  examId: string;

  @ApiProperty({ format: 'date-time' })
  scheduledAt: Date;

  @ApiProperty({ enum: AppointmentStatus, enumName: 'AppointmentStatus' })
  status: AppointmentStatus;
}
