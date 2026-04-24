import { CsvExportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ExportUsersCsvUseCaseInput {
  user: AuthenticatedUser;
}

export interface IExportUsersCsvUseCase {
  execute(input: ExportUsersCsvUseCaseInput): Promise<CsvExportResult>;
}

export const IExportUsersCsvUseCase = Symbol('IExportUsersCsvUseCase');
