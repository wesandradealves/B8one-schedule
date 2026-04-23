import { PaginationMetaResponseDto } from '@/modules/shared/dto/pagination-meta.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentResponseDto } from './appointment.response.dto';

export class ListAppointmentsResponseDto extends PaginationMetaResponseDto {
  @ApiProperty({ type: [AppointmentResponseDto] })
  data: AppointmentResponseDto[];
}
