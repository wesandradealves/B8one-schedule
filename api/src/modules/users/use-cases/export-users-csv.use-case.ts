import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { buildCsvContent } from '@/domain/commons/utils/csv.util';
import { collectAllPaginatedData } from '@/domain/commons/utils/paginated-collection.util';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import {
  ExportUsersCsvUseCaseInput,
  IExportUsersCsvUseCase,
} from '@/domain/interfaces/use-cases/users/export-users-csv.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ExportUsersCsvUseCase implements IExportUsersCsvUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ExportUsersCsvUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can export users CSV');

    const users = await collectAllPaginatedData((pagination) =>
      this.userRepository.listAll(pagination),
    );

    const headers = [
      'id',
      'fullName',
      'email',
      'profile',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    const csvContent = buildCsvContent(
      headers,
      users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    );

    const fileName = this.buildFileName();

    await this.messagingProvider.publish('users.csv.exported', {
      exportedByUserId: input.user.id,
      totalRows: users.length,
      fileName,
    });

    return {
      fileName,
      csvContent,
    };
  }

  private buildFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `users-${timestamp}.csv`;
  }
}
