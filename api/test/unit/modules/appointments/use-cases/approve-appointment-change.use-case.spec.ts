import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApproveAppointmentChangeUseCase } from '@/modules/appointments/use-cases/approve-appointment-change.use-case';
import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ApproveAppointmentChangeUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
  examRepository: jest.Mocked<IExamRepository>;
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
    listExamAvailability: jest.fn(),
    clearChangeRequest: jest.fn(),
  };

  const examRepository: jest.Mocked<IExamRepository> = {
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    findAnyById: jest.fn(),
    createExam: jest.fn(),
    updateExam: jest.fn(),
    deleteExam: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new ApproveAppointmentChangeUseCase(
      appointmentRepository,
      examRepository,
      messagingProvider,
    ),
    appointmentRepository,
    examRepository,
    messagingProvider,
  };
}

function makePendingAppointment() {
  return makeAppointmentEntity({
    id: 'appointment-id-1',
    userId: 'user-id-1',
    changeStatus: AppointmentChangeStatus.PENDING,
    requestedExamId: 'exam-id-2',
    requestedScheduledAt: new Date(Date.now() + 120_000),
    requestedNotes: 'new-note',
  });
}

describe('ApproveAppointmentChangeUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, appointmentRepository } = createSut();

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can approve appointment changes'),
    );

    expect(appointmentRepository.findById).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'missing-id',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws BadRequestException when appointment has no pending change', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ changeStatus: AppointmentChangeStatus.NONE }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new BadRequestException('Appointment has no pending change request'));
  });

  it('throws BadRequestException when pending data is invalid', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        changeStatus: AppointmentChangeStatus.PENDING,
        requestedExamId: null,
        requestedScheduledAt: null,
      }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new BadRequestException('Appointment pending data is invalid'));
  });

  it('throws BadRequestException when requested date is in the past', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        changeStatus: AppointmentChangeStatus.PENDING,
        requestedExamId: 'exam-id-2',
        requestedScheduledAt: new Date(Date.now() - 60_000),
      }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new BadRequestException('Requested scheduled date must be in the future'));
  });

  it('throws NotFoundException when requested exam does not exist', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(makePendingAppointment());
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Requested exam is no longer available'));
  });

  it('throws ConflictException when requested slot is unavailable', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(makePendingAppointment());
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-2' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(
      makeAppointmentEntity({ id: 'conflict-id' }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new ConflictException('Requested date/time is no longer available'));
  });

  it('throws NotFoundException when approve operation returns null', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(makePendingAppointment());
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-2' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.approveAppointmentChange.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('approves change and publishes event', async () => {
    const { useCase, appointmentRepository, examRepository, messagingProvider } = createSut();
    const pending = makePendingAppointment();

    appointmentRepository.findById.mockResolvedValue(pending);
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-2' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.approveAppointmentChange.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'user-id-1' }),
    );

    const output = await useCase.execute({
      appointmentId: 'appointment-id-1',
      user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
    });

    expect(appointmentRepository.approveAppointmentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: 'appointment-id-1',
        examId: 'exam-id-2',
        reviewedByUserId: 'admin-id',
      }),
    );

    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.change-approved', {
      appointmentId: 'appointment-id-1',
      userId: 'user-id-1',
      reviewedByUserId: 'admin-id',
    });

    expect(output.id).toBe('appointment-id-1');
  });

  it('approves change with null notes when pending notes are missing', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    const pendingWithoutNotes = makeAppointmentEntity({
      id: 'appointment-id-2',
      userId: 'user-id-2',
      changeStatus: AppointmentChangeStatus.PENDING,
      requestedExamId: 'exam-id-2',
      requestedScheduledAt: new Date(Date.now() + 120_000),
      requestedNotes: null,
    });

    appointmentRepository.findById.mockResolvedValue(pendingWithoutNotes);
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-2' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.approveAppointmentChange.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-2', userId: 'user-id-2' }),
    );

    await useCase.execute({
      appointmentId: 'appointment-id-2',
      user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
    });

    expect(appointmentRepository.approveAppointmentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: 'appointment-id-2',
        notes: null,
      }),
    );
  });
});
