import { ForbiddenException } from '@nestjs/common';
import { ExportAppointmentsCsvUseCase } from '@/modules/appointments/use-cases/export-appointments-csv.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
  makeExamEntity,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ExportAppointmentsCsvUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
  messagingProvider: jest.Mocked<IMessagingProvider>;
};

function createSut(): Sut {
  const appointmentRepository: jest.Mocked<IAppointmentRepository> = {
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findExamScheduleConflict: jest.fn(),
    createAppointment: jest.fn(),
    updateAppointment: jest.fn(),
    cancelAppointment: jest.fn(),
    requestAppointmentChange: jest.fn(),
    approveAppointmentChange: jest.fn(),
    deleteAppointment: jest.fn(),
    listByUserId: jest.fn(),
    listAll: jest.fn(),
    clearChangeRequest: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new ExportAppointmentsCsvUseCase(
      appointmentRepository,
      messagingProvider,
    ),
    appointmentRepository,
    messagingProvider,
  };
}

describe('ExportAppointmentsCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can export appointments CSV'),
    );
  });

  it('exports appointments csv and publishes event', async () => {
    const { useCase, appointmentRepository, messagingProvider } = createSut();

    appointmentRepository.listAll.mockResolvedValue({
      data: [
        makeAppointmentEntity({
          id: 'appointment-id-1',
          user: makeUserEntity({ fullName: 'Client 1', email: 'client@b8one.com' }),
          exam: makeExamEntity({ name: 'Exam 1' }),
        }),
      ],
      page: 1,
      limit: 500,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
    });

    expect(output.fileName).toContain('appointments-');
    expect(output.csvContent).toContain(
      'id,userId,userEmail,userFullName,examId,examName,scheduledAt,status,notes,changeStatus,requestedExamId,requestedScheduledAt,requestedNotes,reviewedByUserId,reviewedAt,createdAt,updatedAt',
    );
    expect(output.csvContent).toContain('Client 1');
    expect(messagingProvider.publish).toHaveBeenCalledWith(
      'appointments.csv.exported',
      {
        exportedByUserId: 'user-id-1',
        totalRows: 1,
        fileName: output.fileName,
      },
    );
  });
});
