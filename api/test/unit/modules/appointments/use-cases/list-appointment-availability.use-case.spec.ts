import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { ListAppointmentAvailabilityUseCase } from '@/modules/appointments/use-cases/list-appointment-availability.use-case';
import {
  makeAppointmentEntity,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ListAppointmentAvailabilityUseCase;
  appointmentRepository: jest.Mocked<IAppointmentRepository>;
  examRepository: jest.Mocked<IExamRepository>;
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

  return {
    useCase: new ListAppointmentAvailabilityUseCase(
      appointmentRepository,
      examRepository,
    ),
    appointmentRepository,
    examRepository,
  };
}

describe('ListAppointmentAvailabilityUseCase', () => {
  it('throws BadRequestException when startsAt is not before endsAt', async () => {
    const { useCase } = createSut();
    const startsAt = new Date('2026-05-01T12:00:00.000Z');
    const endsAt = new Date('2026-05-01T12:00:00.000Z');

    await expect(
      useCase.execute({
        examId: 'exam-id-1',
        startsAt,
        endsAt,
      }),
    ).rejects.toThrow(new BadRequestException('"startsAt" must be before "endsAt"'));
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        examId: 'exam-id-1',
        startsAt: new Date('2026-05-01T00:00:00.000Z'),
        endsAt: new Date('2026-05-07T23:59:59.999Z'),
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });

  it('returns occupied slots within the selected range', async () => {
    const { useCase, examRepository, appointmentRepository } = createSut();
    const startsAt = new Date('2026-05-01T00:00:00.000Z');
    const endsAt = new Date('2026-05-07T23:59:59.999Z');

    examRepository.findById.mockResolvedValue(makeExamEntity({ id: 'exam-id-1' }));
    appointmentRepository.listExamAvailability.mockResolvedValue([
      makeAppointmentEntity({
        id: 'appointment-id-1',
        examId: 'exam-id-1',
        status: AppointmentStatus.PENDING,
      }),
      makeAppointmentEntity({
        id: 'appointment-id-2',
        examId: 'exam-id-1',
        status: AppointmentStatus.SCHEDULED,
      }),
    ]);

    const output = await useCase.execute({
      examId: 'exam-id-1',
      startsAt,
      endsAt,
    });

    expect(appointmentRepository.listExamAvailability).toHaveBeenCalledWith(
      'exam-id-1',
      startsAt,
      endsAt,
    );
    expect(output).toHaveLength(2);
  });
});
