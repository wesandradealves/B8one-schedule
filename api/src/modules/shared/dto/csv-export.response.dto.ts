import { ApiProperty } from '@nestjs/swagger';

export class CsvExportResponseDto {
  @ApiProperty({ example: 'users-2026-04-23T20-54-31-230Z.csv' })
  fileName: string;

  @ApiProperty({
    description: 'Generated CSV file content',
    example: 'id,fullName,email,profile,isActive\nuser-id-1,John Doe,john@b8one.com,CLIENT,true',
  })
  csvContent: string;
}
