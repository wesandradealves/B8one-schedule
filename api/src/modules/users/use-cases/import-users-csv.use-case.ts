import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { CsvImportResult } from '@/domain/commons/interfaces/csv.interface';
import {
  getOptionalCsvValue,
  getRequiredCsvValue,
  parseCsvBoolean,
} from '@/domain/commons/utils/csv-field.util';
import {
  assertRequiredCsvHeaders,
  deduplicateCsvRows,
  parseCsvDocument,
} from '@/domain/commons/utils/csv.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  IImportUsersCsvUseCase,
  ImportUsersCsvUseCaseInput,
} from '@/domain/interfaces/use-cases/users/import-users-csv.use-case';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ImportUsersCsvUseCase implements IImportUsersCsvUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashProvider)
    private readonly hashProvider: IHashProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ImportUsersCsvUseCaseInput): Promise<CsvImportResult> {
    assertAdmin(input.user, 'Only admin users can import users CSV');

    const { headers, rows } = this.parseCsv(input.csvContent);
    const { uniqueRows, duplicateRows } = deduplicateCsvRows(rows);
    this.assertHeaders(headers, ['fullName', 'email', 'profile', 'isActive']);

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

    await this.messagingProvider.publish('users.csv.imported', {
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
    const fullName = getRequiredCsvValue(row, 'fullName', rowNumber);
    const email = getRequiredCsvValue(row, 'email', rowNumber).toLowerCase();
    const profileRaw = getRequiredCsvValue(row, 'profile', rowNumber);
    const isActive = parseCsvBoolean(row.isActive ?? null, 'isActive', rowNumber, true);
    const password = getOptionalCsvValue(row, 'password');

    if (!this.isValidEmail(email)) {
      throw new Error(`Row ${rowNumber}: "email" must be valid`);
    }

    if (fullName.length < 3) {
      throw new Error(`Row ${rowNumber}: "fullName" must have at least 3 characters`);
    }

    const profile = this.parseProfile(profileRaw, rowNumber);
    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser) {
      if (!password) {
        throw new Error(`Row ${rowNumber}: "password" is required for new users`);
      }

      const passwordHash = await this.hashProvider.hash(password);
      await this.userRepository.createUser({
        fullName,
        email,
        passwordHash,
        profile,
        isActive,
      });

      return 'created';
    }

    const updatePayload: {
      fullName: string;
      profile: UserProfile;
      isActive: boolean;
      passwordHash?: string;
    } = {
      fullName,
      profile,
      isActive,
    };

    if (password) {
      updatePayload.passwordHash = await this.hashProvider.hash(password);
    }

    const updated = await this.userRepository.updateUser(existingUser.id, updatePayload);
    if (!updated) {
      throw new Error(`Row ${rowNumber}: failed to update user`);
    }

    return 'updated';
  }

  private parseProfile(rawProfile: string, rowNumber: number): UserProfile {
    const normalized = rawProfile.trim().toUpperCase() as UserProfile;
    if (!Object.values(UserProfile).includes(normalized)) {
      throw new Error(
        `Row ${rowNumber}: "profile" must be one of ${Object.values(UserProfile).join('/')}`,
      );
    }

    return normalized;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
