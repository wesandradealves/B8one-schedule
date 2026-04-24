import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import {
  getOptionalCsvValue,
  getRequiredCsvValue,
  parseCsvDate,
} from '@/domain/commons/utils/csv-field.util';
import {
  assertRequiredCsvHeaders,
  deduplicateCsvRows,
  parseCsvDocument,
} from '@/domain/commons/utils/csv.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  IImportAppointmentsCsvUseCase,
  ImportAppointmentsCsvUseCaseInput,
} from '@/domain/interfaces/use-cases/appointments/import-appointments-csv.use-case';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ImportAppointmentsCsvUseCase implements IImportAppointmentsCsvUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(
    input: ImportAppointmentsCsvUseCaseInput,
  ): Promise<CsvImportResult> {
    assertAdmin(input.user, 'Only admin users can import appointments CSV');

    const { headers, rows } = this.parseCsv(input.csvContent);
    const { uniqueRows, duplicateRows } = deduplicateCsvRows(rows);
    this.assertHeaders(headers, ['userId', 'examId', 'scheduledAt']);

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

    await this.messagingProvider.publish('appointments.csv.imported', {
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
    const userId = getRequiredCsvValue(row, 'userId', rowNumber);
    const examId = getRequiredCsvValue(row, 'examId', rowNumber);
    const scheduledAt = parseCsvDate(row.scheduledAt ?? null, 'scheduledAt', rowNumber);
    const notes = getOptionalCsvValue(row, 'notes');
    const status = this.parseStatus(getOptionalCsvValue(row, 'status'), rowNumber);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error(`Row ${rowNumber}: "userId" references an invalid user`);
    }

    const exam = await this.examRepository.findAnyById(examId);
    if (!exam) {
      throw new Error(`Row ${rowNumber}: "examId" references an invalid exam`);
    }

    if (status === AppointmentStatus.SCHEDULED && scheduledAt.getTime() <= Date.now()) {
      throw new Error(
        `Row ${rowNumber}: "scheduledAt" must be in the future for scheduled appointments`,
      );
    }

    const conflict = await this.appointmentRepository.findExamScheduleConflict(
      examId,
      scheduledAt,
      rowId ?? undefined,
    );

    if (conflict && status === AppointmentStatus.SCHEDULED) {
      throw new Error(
        `Row ${rowNumber}: there is already an appointment for this exam/time slot`,
      );
    }

    if (rowId) {
      const existingAppointment = await this.appointmentRepository.findById(rowId);
      if (!existingAppointment) {
        throw new Error(`Row ${rowNumber}: appointment id "${rowId}" was not found`);
      }

      if (existingAppointment.userId !== userId) {
        throw new Error(
          `Row ${rowNumber}: "userId" does not match existing appointment owner`,
        );
      }

      const updatedAppointment = await this.appointmentRepository.updateAppointment(rowId, {
        examId,
        scheduledAt,
        notes,
        status,
      });

      if (!updatedAppointment) {
        throw new Error(`Row ${rowNumber}: failed to update appointment "${rowId}"`);
      }

      return 'updated';
    }

    const createdAppointment = await this.appointmentRepository.createAppointment({
      userId,
      examId,
      scheduledAt,
      notes: notes ?? undefined,
    });

    if (status !== AppointmentStatus.SCHEDULED) {
      await this.appointmentRepository.updateAppointment(createdAppointment.id, {
        status,
      });
    }

    return 'created';
  }

  private parseStatus(rawValue: string | null, rowNumber: number): AppointmentStatus {
    if (!rawValue) {
      return AppointmentStatus.SCHEDULED;
    }

    const normalized = rawValue.trim().toUpperCase() as AppointmentStatus;
    if (!Object.values(AppointmentStatus).includes(normalized)) {
      throw new Error(
        `Row ${rowNumber}: "status" must be one of ${Object.values(AppointmentStatus).join('/')}`,
      );
    }

    return normalized;
  }
}
