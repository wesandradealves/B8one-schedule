import { CsvExportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ExportAppointmentsCsvUseCaseInput {
  user: AuthenticatedUser;
}

export interface IExportAppointmentsCsvUseCase {
  execute(input: ExportAppointmentsCsvUseCaseInput): Promise<CsvExportResult>;
}

export const IExportAppointmentsCsvUseCase = Symbol(
  'IExportAppointmentsCsvUseCase',
);
