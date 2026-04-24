import { ApiProperty } from '@nestjs/swagger';

export class CsvImportErrorResponseDto {
  @ApiProperty({ example: 2 })
  row: number;

  @ApiProperty({ example: 'Row 2: "email" is required' })
  message: string;
}

export class CsvImportResponseDto {
  @ApiProperty({ example: 10 })
  processedRows: number;

  @ApiProperty({ example: 6 })
  createdRows: number;

  @ApiProperty({ example: 2 })
  updatedRows: number;

  @ApiProperty({ example: 2 })
  skippedRows: number;

  @ApiProperty({ type: [CsvImportErrorResponseDto] })
  errors: CsvImportErrorResponseDto[];
}
