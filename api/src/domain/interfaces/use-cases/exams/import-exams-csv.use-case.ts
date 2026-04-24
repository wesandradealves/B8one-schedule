import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ImportExamsCsvUseCaseInput {
  user: AuthenticatedUser;
  csvContent: string;
}

export interface IImportExamsCsvUseCase {
  execute(input: ImportExamsCsvUseCaseInput): Promise<CsvImportResult>;
}

export const IImportExamsCsvUseCase = Symbol('IImportExamsCsvUseCase');
