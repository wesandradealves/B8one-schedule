import { PaginationMetaResponseDto } from '@/modules/shared/dto/pagination-meta.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class ListUsersResponseDto extends PaginationMetaResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];
}
