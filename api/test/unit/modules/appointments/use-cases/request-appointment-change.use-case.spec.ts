import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestAppointmentChangeUseCase } from '@/modules/appointments/use-cases/request-appointment-change.use-case';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: RequestAppointmentChangeUseCase;
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
    useCase: new RequestAppointmentChangeUseCase(
      appointmentRepository,
      examRepository,
      messagingProvider,
    ),
    appointmentRepository,
    examRepository,
    messagingProvider,
  };
}

describe('RequestAppointmentChangeUseCase', () => {
  it('throws NotFoundException when appointment does not exist', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'missing-id',
        user: makeAuthenticatedUser(),
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('throws ForbiddenException when requester is not owner', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'owner-id' }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'other-id' }),
      }),
    ).rejects.toThrow(new ForbiddenException('You can only edit your own appointments'));
  });

  it('throws BadRequestException when appointment is not scheduled', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ status: AppointmentStatus.CANCELLED, userId: 'owner-id' }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id' }),
      }),
    ).rejects.toThrow(new BadRequestException('Only scheduled appointments can be edited'));
  });

  it('throws BadRequestException when target date is in the past', async () => {
    const { useCase, appointmentRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        userId: 'owner-id',
        scheduledAt: new Date(Date.now() + 60_000),
      }),
    );

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id' }),
        scheduledAt: new Date(Date.now() - 60_000),
      }),
    ).rejects.toThrow(new BadRequestException('Scheduled date must be in the future'));
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ userId: 'owner-id', examId: 'exam-id-1' }),
    );
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id' }),
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('throws BadRequestException when no effective change is provided', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    const scheduledAt = new Date(Date.now() + 120_000);

    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        userId: 'owner-id',
        examId: 'exam-id-1',
        scheduledAt,
        notes: 'same-note',
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id' }),
        examId: 'exam-id-1',
        scheduledAt,
        notes: 'same-note',
      }),
    ).rejects.toThrow(
      new BadRequestException('Change request must include at least one different value'),
    );
  });

  it('throws NotFoundException when repository update returns null', async () => {
    const { useCase, appointmentRepository, examRepository } = createSut();
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ userId: 'owner-id', examId: 'exam-id-1' }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.requestAppointmentChange.mockResolvedValue(null);

    await expect(
      useCase.execute({
        appointmentId: 'appointment-id-1',
        user: makeAuthenticatedUser({ id: 'owner-id' }),
        notes: 'changed-note',
      }),
    ).rejects.toThrow(new NotFoundException('Appointment not found'));
  });

  it('requests change and publishes event', async () => {
    const { useCase, appointmentRepository, examRepository, messagingProvider } = createSut();
    const newSchedule = new Date(Date.now() + 240_000);

    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'owner-id',
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() + 120_000),
      }),
    );
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-2' }));
    appointmentRepository.requestAppointmentChange.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'owner-id',
        requestedExamId: 'exam-id-2',
        requestedScheduledAt: newSchedule,
      }),
    );

    const output = await useCase.execute({
      appointmentId: 'appointment-id-1',
      user: makeAuthenticatedUser({ id: 'owner-id' }),
      examId: 'exam-id-2',
      scheduledAt: newSchedule,
      notes: 'new-note',
    });

    expect(appointmentRepository.requestAppointmentChange).toHaveBeenCalledWith({
      appointmentId: 'appointment-id-1',
      examId: 'exam-id-2',
      scheduledAt: newSchedule,
      notes: 'new-note',
    });

    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.change-requested', {
      appointmentId: 'appointment-id-1',
      userId: 'owner-id',
      requestedExamId: 'exam-id-2',
      requestedScheduledAt: newSchedule,
    });

    expect(output.id).toBe('appointment-id-1');
  });
});
