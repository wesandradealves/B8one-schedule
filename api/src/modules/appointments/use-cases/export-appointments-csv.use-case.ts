import { buildCsvContent } from '@/domain/commons/utils/csv.util';
import { collectAllPaginatedData } from '@/domain/commons/utils/paginated-collection.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import {
  ExportAppointmentsCsvUseCaseInput,
  IExportAppointmentsCsvUseCase,
} from '@/domain/interfaces/use-cases/appointments/export-appointments-csv.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ExportAppointmentsCsvUseCase
  implements IExportAppointmentsCsvUseCase
{
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ExportAppointmentsCsvUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can export appointments CSV');

    const appointments = await collectAllPaginatedData((pagination) =>
      this.appointmentRepository.listAll(pagination),
    );

    const headers = [
      'id',
      'userId',
      'userEmail',
      'userFullName',
      'examId',
      'examName',
      'scheduledAt',
      'status',
      'notes',
      'changeStatus',
      'requestedExamId',
      'requestedScheduledAt',
      'requestedNotes',
      'reviewedByUserId',
      'reviewedAt',
      'createdAt',
      'updatedAt',
    ];

    const csvContent = buildCsvContent(
      headers,
      appointments.map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        userEmail: appointment.user?.email ?? null,
        userFullName: appointment.user?.fullName ?? null,
        examId: appointment.examId,
        examName: appointment.exam?.name ?? null,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        notes: appointment.notes,
        changeStatus: appointment.changeStatus,
        requestedExamId: appointment.requestedExamId,
        requestedScheduledAt: appointment.requestedScheduledAt,
        requestedNotes: appointment.requestedNotes,
        reviewedByUserId: appointment.reviewedByUserId,
        reviewedAt: appointment.reviewedAt,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      })),
    );

    const fileName = this.buildFileName();

    await this.messagingProvider.publish('appointments.csv.exported', {
      exportedByUserId: input.user.id,
      totalRows: appointments.length,
      fileName,
    });

    return {
      fileName,
      csvContent,
    };
  }

  private buildFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `appointments-${timestamp}.csv`;
  }
}
