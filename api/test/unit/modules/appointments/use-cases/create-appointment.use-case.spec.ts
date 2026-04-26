import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentUseCase } from '@/modules/appointments/use-cases/create-appointment.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { Permission } from '@/domain/commons/enums/permission.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

const makeFutureSchedule = (): Date => {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(10, 0, 0, 0);
  return value;
};

const makeFutureWeekdaySchedule = (
  weekday: number,
  hours: number,
  minutes = 0,
): Date => {
  const value = new Date();
  const dayOffset = (weekday - value.getDay() + 7) % 7;
  value.setDate(value.getDate() + dayOffset);
  value.setHours(hours, minutes, 0, 0);

  if (value.getTime() <= Date.now()) {
    value.setDate(value.getDate() + 7);
  }

  return value;
};

type Sut = {
  useCase: CreateAppointmentUseCase;
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
    useCase: new CreateAppointmentUseCase(appointmentRepository, examRepository, messagingProvider),
    appointmentRepository,
    examRepository,
    messagingProvider,
  };
}

describe('CreateAppointmentUseCase', () => {
  it('throws BadRequestException when scheduled date is in the past', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ id: 'user-id-1', profile: UserProfile.CLIENT }),
        examId: 'exam-id-1',
        scheduledAt: new Date(Date.now() - 60_000),
      }),
    ).rejects.toThrow(new BadRequestException('Scheduled date must be in the future'));
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ id: 'user-id-1', profile: UserProfile.CLIENT }),
        examId: 'exam-id-1',
        scheduledAt: makeFutureSchedule(),
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('throws ConflictException when there is exam schedule conflict', async () => {
    const { useCase, examRepository, appointmentRepository } = createSut();
    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(
      makeAppointmentEntity({ id: 'conflict-id' }),
    );

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ id: 'user-id-1', profile: UserProfile.CLIENT }),
        examId: 'exam-id-1',
        scheduledAt: makeFutureSchedule(),
      }),
    ).rejects.toThrow(
      new ConflictException('There is already an appointment for this exam/time slot'),
    );
  });

  it('throws BadRequestException when scheduled date is outside exam availability', async () => {
    const { useCase, examRepository, appointmentRepository } = createSut();
    examRepository.findById.mockResolvedValue(
      makeExamEntity({
        id: 'exam-id-1',
        availableWeekdays: [1],
        availableStartTime: '09:00',
        availableEndTime: '10:00',
      }),
    );
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ id: 'user-id-1', profile: UserProfile.CLIENT }),
        examId: 'exam-id-1',
        scheduledAt: makeFutureWeekdaySchedule(2, 11, 0),
      }),
    ).rejects.toThrow(
      new BadRequestException('Scheduled date is outside exam availability'),
    );
  });

  it('creates pending appointment for client and publishes event', async () => {
    const { useCase, examRepository, appointmentRepository, messagingProvider } = createSut();

    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.createAppointment.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'user-id-1',
        examId: 'exam-id-1',
        status: AppointmentStatus.PENDING,
      }),
    );

    const scheduledAt = makeFutureSchedule();
    const output = await useCase.execute({
      user: makeAuthenticatedUser({ id: 'user-id-1', profile: UserProfile.CLIENT }),
      examId: 'exam-id-1',
      scheduledAt,
      notes: 'note',
    });

    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith({
      userId: 'user-id-1',
      examId: 'exam-id-1',
      scheduledAt,
      notes: 'note',
      status: AppointmentStatus.PENDING,
    });

    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.created', {
      appointmentId: 'appointment-id-1',
      userId: 'user-id-1',
      examId: 'exam-id-1',
      status: AppointmentStatus.PENDING,
      permission: Permission.APPOINTMENTS_CREATE,
    });

    expect(output.id).toBe('appointment-id-1');
  });

  it('creates scheduled appointment for admin', async () => {
    const { useCase, examRepository, appointmentRepository } = createSut();

    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.createAppointment.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        userId: 'admin-id',
        examId: 'exam-id-1',
        status: AppointmentStatus.SCHEDULED,
      }),
    );

    const scheduledAt = makeFutureSchedule();
    await useCase.execute({
      user: makeAuthenticatedUser({ id: 'admin-id', profile: UserProfile.ADMIN }),
      examId: 'exam-id-1',
      scheduledAt,
      notes: 'note',
    });

    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith({
      userId: 'admin-id',
      examId: 'exam-id-1',
      scheduledAt,
      notes: 'note',
      status: AppointmentStatus.SCHEDULED,
    });
  });
});
