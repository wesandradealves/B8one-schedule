import { CsvExportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ExportExamsCsvUseCaseInput {
  user: AuthenticatedUser;
}

export interface IExportExamsCsvUseCase {
  execute(input: ExportExamsCsvUseCaseInput): Promise<CsvExportResult>;
}

export const IExportExamsCsvUseCase = Symbol('IExportExamsCsvUseCase');
