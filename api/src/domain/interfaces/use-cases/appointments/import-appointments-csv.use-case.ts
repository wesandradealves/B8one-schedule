import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ImportAppointmentsCsvUseCaseInput {
  user: AuthenticatedUser;
  csvContent: string;
}

export interface IImportAppointmentsCsvUseCase {
  execute(input: ImportAppointmentsCsvUseCaseInput): Promise<CsvImportResult>;
}

export const IImportAppointmentsCsvUseCase = Symbol(
  'IImportAppointmentsCsvUseCase',
);
