import { ForbiddenException } from '@nestjs/common';
import { ImportAppointmentsCsvUseCase } from '@/modules/appointments/use-cases/import-appointments-csv.use-case';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import {
  makeAppointmentEntity,
  makeAuthenticatedUser,
  makeExamEntity,
  makeUserEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ImportAppointmentsCsvUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
  examRepository: jest.Mocked<IExamRepository>;
  userRepository: jest.Mocked<IUserRepository>;
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

  const userRepository: jest.Mocked<IUserRepository> = {
    listAll: jest.fn(),
    existsByEmail: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const messagingProvider: jest.Mocked<IMessagingProvider> = {
    publish: jest.fn(),
  };

  return {
    useCase: new ImportAppointmentsCsvUseCase(
      appointmentRepository,
      examRepository,
      userRepository,
      messagingProvider,
    ),
    appointmentRepository,
    examRepository,
    userRepository,
    messagingProvider,
  };
}

describe('ImportAppointmentsCsvUseCase', () => {
  it('throws ForbiddenException when requester is not admin', async () => {
    const { useCase } = createSut();

    await expect(
      useCase.execute({
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
        csvContent: 'userId,examId,scheduledAt\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(
      new ForbiddenException('Only admin users can import appointments CSV'),
    );
  });

  it('imports new appointments and updates existing ones', async () => {
    const {
      useCase,
      appointmentRepository,
      examRepository,
      userRepository,
      messagingProvider,
    } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'user-id-1' }));
    examRepository.findAnyById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.createAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'created-appointment-id', userId: 'user-id-1' }),
    );
    appointmentRepository.findById.mockResolvedValue(
      makeAppointmentEntity({ id: 'appointment-id-1', userId: 'user-id-1' }),
    );
    appointmentRepository.updateAppointment.mockResolvedValue(
      makeAppointmentEntity({
        id: 'appointment-id-1',
        status: AppointmentStatus.CANCELLED,
      }),
    );

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'id,userId,examId,scheduledAt,status,notes\n' +
        ',user-id-1,exam-id-1,2099-01-01T10:00:00.000Z,SCHEDULED,New note\n' +
        'appointment-id-1,user-id-1,exam-id-1,2099-01-02T10:00:00.000Z,CANCELLED,Updated note',
    });

    expect(output).toEqual({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    expect(appointmentRepository.createAppointment).toHaveBeenCalledTimes(1);
    expect(appointmentRepository.updateAppointment).toHaveBeenCalledTimes(1);
    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.csv.imported', {
      importedByUserId: 'user-id-1',
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
    });
  });

  it('skips duplicated rows from the same csv payload', async () => {
    const {
      useCase,
      appointmentRepository,
      examRepository,
      userRepository,
      messagingProvider,
    } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'user-id-1' }));
    examRepository.findAnyById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.createAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'created-appointment-id', userId: 'user-id-1' }),
    );

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'userId,examId,scheduledAt,status,notes\n' +
        'user-id-1,exam-id-1,2099-01-01T10:00:00.000Z,SCHEDULED,New note\n' +
        'user-id-1,exam-id-1,2099-01-01T10:00:00.000Z,SCHEDULED,New note',
    });

    expect(output).toEqual({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 0,
      skippedRows: 1,
      errors: [],
    });
    expect(appointmentRepository.createAppointment).toHaveBeenCalledTimes(1);
    expect(messagingProvider.publish).toHaveBeenCalledWith('appointments.csv.imported', {
      importedByUserId: 'user-id-1',
      processedRows: 2,
      createdRows: 1,
      updatedRows: 0,
      skippedRows: 1,
    });
  });

  it('defaults status to SCHEDULED when CSV row omits status', async () => {
    const { useCase, appointmentRepository, examRepository, userRepository } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'user-id-1' }));
    examRepository.findAnyById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);
    appointmentRepository.createAppointment.mockResolvedValue(
      makeAppointmentEntity({ id: 'created-appointment-id', userId: 'user-id-1' }),
    );

    await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent: 'userId,examId,scheduledAt,notes\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z,Imported',
    });

    expect(appointmentRepository.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AppointmentStatus.SCHEDULED,
      }),
    );
  });

  it('skips rows outside exam availability for active statuses', async () => {
    const { useCase, appointmentRepository, examRepository, userRepository } = createSut();

    userRepository.findById.mockResolvedValue(makeUserEntity({ id: 'user-id-1' }));
    examRepository.findAnyById.mockResolvedValue(
      makeExamEntity({
        id: 'exam-id-1',
        availableWeekdays: [0, 1, 2, 3, 4, 5, 6],
        availableStartTime: '09:00',
        availableEndTime: '10:00',
      }),
    );
    appointmentRepository.findExamScheduleConflict.mockResolvedValue(null);

    const output = await useCase.execute({
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      csvContent:
        'userId,examId,scheduledAt,status\n' +
        'user-id-1,exam-id-1,2099-01-06T11:00:00.000Z,SCHEDULED',
    });

    expect(output.createdRows).toBe(0);
    expect(output.skippedRows).toBe(1);
    expect(output.errors).toEqual([
      expect.objectContaining({
        row: 2,
        message: 'Row 2: "scheduledAt" is outside exam availability',
      }),
    ]);
    expect(appointmentRepository.createAppointment).not.toHaveBeenCalled();
  });
});
