import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAppointmentUseCase } from '@/modules/appointments/use-cases/update-appointment.use-case';
import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
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
  useCase: UpdateAppointmentUseCase;
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
    useCase: new UpdateAppointmentUseCase(
      appointmentRepository,
      examRepository,
      messagingProvider,
    ),
    appointmentRepository,
    examRepository,
    messagingProvider,
  };
}

describe('UpdateAppointmentUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase, appointmentRepository } = createSut();

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new ForbiddenException('Only admin users can update appointments'));

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

  it('throws BadRequestException when scheduled target date is in the past', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ status: AppointmentStatus.SCHEDULED }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        scheduledAt: new Date(Date.now() - 60_000),
      }),
    ).rejects.toThrow(new BadRequestException('Scheduled date must be in the future'));
  });

  it('throws NotFoundException when exam does not exist for scheduled status', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ status: AppointmentStatus.SCHEDULED, examId: 'exam-id-1' }),
    );
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('throws ConflictException when scheduled slot is unavailable', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        status: AppointmentStatus.SCHEDULED,
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() + 120_000),
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(
      makeAppointmentEntity({ id: 'conflict-id' }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(
      new ConflictException('There is already an appointment for this exam/time slot'),
    );
  });

  it('cancels appointment through cancel flow when target status is CANCELLED', async () => {
    const { useCase, appointmentRepository, messagingProvider } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );
    appointmentRepository.cancelAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id', status: AppointmentStatus.CANCELLED }),
    );

    const output = await useCase.execute({
      appointmentId: 'appointment-id-1',
      user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
      status: AppointmentStatus.CANCELLED,
    });

    expect(appointmentRepository.cancelAppointment).toHaveBeenCalledWith('appointment-id-1');
    expect(appointmentRepository.clearChangeRequest).not.toHaveBeenCalled();
    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.updated', {
      appointmentId: 'appointment-id-1',
      userId: 'owner-id',
      updatedByUserId: 'admin-id',
    });
    expect(output.status).toBe(AppointmentStatus.CANCELLED);
  });

  it('throws NotFoundException when cancel flow returns null', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1' }),
    );
    appointmentRepository.cancelAppointment.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
        status: AppointmentStatus.CANCELLED,
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws NotFoundException when update operation returns null', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        status: AppointmentStatus.SCHEDULED,
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() + 120_000),
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.updateAppointment.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws NotFoundException when appointment is missing after clearing change request', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        status: AppointmentStatus.SCHEDULED,
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() + 120_000),
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.updateAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );
    appointmentRepository.findById.mockResolvedValueOnce(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        status: AppointmentStatus.SCHEDULED,
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() + 120_000),
      }),
    );
    appointmentRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('updates appointment, clears change request and publishes event', async () => {
    const { useCase, appointmentRepository, examRepository, messagingProvider } = createSut();
    const futureDate = new Date(Date.now() + 240_000);

    appointmentRepository.findById.mockResolvedValueOnce(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'owner-id',
        status: AppointmentStatus.SCHEDULED,
        examId: 'exam-id-1',
        scheduledAt: futureDate,
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.updateAppointment.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'owner-id',
        status: AppointmentStatus.SCHEDULED,
      }),
    );
    appointmentRepository.findById.mockResolvedValueOnce(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'owner-id',
        status: AppointmentStatus.SCHEDULED,
      }),
    );

    const output = await useCase.execute({
      appointmentId: 'appointment-id-1',
      user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
      notes: 'updated-note',
    });

    expect(appointmentRepository.clearChangeRequest).toHaveBeenCalledWith(
      'appointment-id-1',
      AppointmentChangeStatus.NONE,
    );
    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.updated', {
      appointmentId: 'appointment-id-1',
      userId: 'owner-id',
      updatedByUserId: 'admin-id',
    });
    expect(output.id).toBe('appointment-id-1');
  });
});
