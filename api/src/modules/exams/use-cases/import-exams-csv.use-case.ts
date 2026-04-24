import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import {
  getOptionalCsvValue,
  getRequiredCsvValue,
  parseCsvBoolean,
  parseCsvInteger,
} from '@/domain/commons/utils/csv-field.util';
import {
  assertRequiredCsvHeaders,
  deduplicateCsvRows,
  parseCsvDocument,
} from '@/domain/commons/utils/csv.util';
import { bumpExamsListCacheVersion } from '@/domain/commons/utils/exam-cache.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  IImportExamsCsvUseCase,
  ImportExamsCsvUseCaseInput,
} from '@/domain/interfaces/use-cases/exams/import-exams-csv.use-case';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ImportExamsCsvUseCase implements IImportExamsCsvUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(ICacheProvider)
    private readonly cacheProvider: ICacheProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ImportExamsCsvUseCaseInput): Promise<CsvImportResult> {
    assertAdmin(input.user, 'Only admin users can import exams CSV');

    const { headers, rows } = this.parseCsv(input.csvContent);
    const { uniqueRows, duplicateRows } = deduplicateCsvRows(rows);
    this.assertHeaders(headers, [
      'name',
      'durationMinutes',
      'priceCents',
      'isActive',
    ]);

    const result: CsvImportResult = {
      processedRows: rows.length,
      createdRows: 0,
      updatedRows: 0,
      skippedRows: duplicateRows.length,
      errors: [],
    };

    for (let index = 0; index < uniqueRows.length; index += 1) {
      const { row, rowNumber } = uniqueRows[index];

      try {
        const action = await this.processRow(row, rowNumber);
        if (action === 'created') {
          result.createdRows += 1;
        } else {
          result.updatedRows += 1;
        }
      } catch (error) {
        result.skippedRows += 1;
        result.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await bumpExamsListCacheVersion(this.cacheProvider);

    await this.messagingProvider.publish('exams.csv.imported', {
      importedByUserId: input.user.id,
      processedRows: result.processedRows,
      createdRows: result.createdRows,
      updatedRows: result.updatedRows,
      skippedRows: result.skippedRows,
    });

    return result;
  }

  private parseCsv(csvContent: string) {
    try {
      return parseCsvDocument(csvContent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid CSV payload';
      throw new BadRequestException(message);
    }
  }

  private assertHeaders(headers: string[], requiredHeaders: string[]): void {
    try {
      assertRequiredCsvHeaders(headers, requiredHeaders);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid CSV headers';
      throw new BadRequestException(message);
    }
  }

  private async processRow(
    row: Record<string, string>,
    rowNumber: number,
  ): Promise<'created' | 'updated'> {
    const rowId = getOptionalCsvValue(row, 'id');
    const name = getRequiredCsvValue(row, 'name', rowNumber);
    const durationMinutes = parseCsvInteger(
      row.durationMinutes ?? null,
      'durationMinutes',
      rowNumber,
    );
    const priceCents = parseCsvInteger(row.priceCents ?? null, 'priceCents', rowNumber);
    const isActive = parseCsvBoolean(row.isActive ?? null, 'isActive', rowNumber, true);
    const description = getOptionalCsvValue(row, 'description');

    if (durationMinutes <= 0) {
      throw new Error(`Row ${rowNumber}: "durationMinutes" must be greater than zero`);
    }

    if (priceCents < 0) {
      throw new Error(`Row ${rowNumber}: "priceCents" cannot be negative`);
    }

    if (rowId) {
      const existingExam = await this.examRepository.findAnyById(rowId);
      if (!existingExam) {
        throw new Error(`Row ${rowNumber}: exam id "${rowId}" was not found`);
      }

      const updatedExam = await this.examRepository.updateExam(existingExam.id, {
        name,
        description,
        durationMinutes,
        priceCents,
        isActive,
      });

      if (!updatedExam) {
        throw new Error(`Row ${rowNumber}: failed to update exam "${rowId}"`);
      }

      return 'updated';
    }

    const createdExam = await this.examRepository.createExam({
      name,
      description,
      durationMinutes,
      priceCents,
    });

    if (!isActive) {
      await this.examRepository.updateExam(createdExam.id, { isActive: false });
    }

    return 'created';
  }
}
