import { buildCsvContent } from '@/domain/commons/utils/csv.util';
import { collectAllPaginatedData } from '@/domain/commons/utils/paginated-collection.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  ExportExamsCsvUseCaseInput,
  IExportExamsCsvUseCase,
} from '@/domain/interfaces/use-cases/exams/export-exams-csv.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ExportExamsCsvUseCase implements IExportExamsCsvUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ExportExamsCsvUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can export exams CSV');

    const exams = await collectAllPaginatedData((pagination) =>
      this.examRepository.listAll(pagination),
    );

    const headers = [
      'id',
      'name',
      'description',
      'durationMinutes',
      'priceCents',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    const csvContent = buildCsvContent(
      headers,
      exams.map((exam) => ({
        id: exam.id,
        name: exam.name,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        priceCents: exam.priceCents,
        isActive: exam.isActive,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      })),
    );

    const fileName = this.buildFileName();

    await this.messagingProvider.publish('exams.csv.exported', {
      exportedByUserId: input.user.id,
      totalRows: exams.length,
      fileName,
    });

    return {
      fileName,
      csvContent,
    };
  }

  private buildFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `exams-${timestamp}.csv`;
  }
}
