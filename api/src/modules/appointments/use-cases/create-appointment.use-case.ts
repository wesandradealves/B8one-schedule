import { Permission } from '@/domain/commons/enums/permission.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import {
  isScheduledAtWithinExamAvailability,
  normalizeExamAvailability,
} from '@/domain/commons/utils/exam-availability.util';
import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  CreateAppointmentUseCaseInput,
  ICreateAppointmentUseCase,
} from '@/domain/interfaces/use-cases/appointments/create-appointment.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CreateAppointmentUseCase implements ICreateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: CreateAppointmentUseCaseInput) {
    if (input.scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    const exam = await this.examRepository.findById(input.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const examAvailability = normalizeExamAvailability(exam);
    if (
      !isScheduledAtWithinExamAvailability(
        input.scheduledAt,
        exam.durationMinutes,
        examAvailability,
      )
    ) {
      throw new BadRequestException(
        'Scheduled date is outside exam availability',
      );
    }

    const conflict = await this.appointmentRepository.findExamScheduleConflict(
      input.examId,
      input.scheduledAt,
    );

    if (conflict) {
      throw new ConflictException('There is already an appointment for this exam/time slot');
    }

    const initialStatus = isAdmin(input.user)
      ? AppointmentStatus.SCHEDULED
      : AppointmentStatus.PENDING;
    const appointment = await this.appointmentRepository.createAppointment({
      userId: input.user.id,
      examId: input.examId,
      scheduledAt: input.scheduledAt,
      notes: input.notes,
      status: initialStatus,
    });

    await this.messagingProvider.publish('appointments.created', {
      appointmentId: appointment.id,
      userId: appointment.userId,
      examId: appointment.examId,
      status: appointment.status,
      permission: Permission.APPOINTMENTS_CREATE,
    });

    return appointment;
  }
}
