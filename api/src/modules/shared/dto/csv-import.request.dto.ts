import { ApiProperty } from '@nestjs/swagger';

export class CsvImportRequestDto {
  @ApiProperty({
    description: 'CSV content including headers in the first row',
    example: 'fullName,email,password,profile,isActive\nJohn Doe,john@b8one.com,Secret@123,CLIENT,true',
  })
  csvContent: string;
}
