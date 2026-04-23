import { PaginationMetaResponseDto } from '@/modules/shared/dto/pagination-meta.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ExamResponseDto } from './exam.response.dto';

export class ListExamsResponseDto extends PaginationMetaResponseDto {
  @ApiProperty({ type: [ExamResponseDto] })
  data: ExamResponseDto[];
}
