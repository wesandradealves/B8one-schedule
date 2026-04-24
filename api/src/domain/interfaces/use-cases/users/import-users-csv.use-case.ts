import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ImportUsersCsvUseCaseInput {
  user: AuthenticatedUser;
  csvContent: string;
}

export interface IImportUsersCsvUseCase {
  execute(input: ImportUsersCsvUseCaseInput): Promise<CsvImportResult>;
}

export const IImportUsersCsvUseCase = Symbol('IImportUsersCsvUseCase');
