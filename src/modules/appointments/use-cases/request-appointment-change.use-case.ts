import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { assertOwner } from '@/domain/commons/utils/profile-authorization.util';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import {
  IRequestAppointmentChangeUseCase,
  RequestAppointmentChangeUseCaseInput,
} from '@/domain/interfaces/use-cases/appointments/request-appointment-change.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class RequestAppointmentChangeUseCase
  implements IRequestAppointmentChangeUseCase
{
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: RequestAppointmentChangeUseCaseInput) {
    const appointment = await this.appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    assertOwner(input.user, appointment.userId, 'You can only edit your own appointments');

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be edited');
    }

    const targetExamId = input.examId ?? appointment.examId;
    const targetScheduledAt = input.scheduledAt ?? appointment.scheduledAt;
    const targetNotes = input.notes ?? appointment.notes ?? null;

    if (targetScheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    const exam = await this.examRepository.findById(targetExamId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const isSameExam = targetExamId === appointment.examId;
    const isSameSchedule =
      targetScheduledAt.toISOString() === appointment.scheduledAt.toISOString();
    const isSameNotes = targetNotes === (appointment.notes ?? null);

    if (isSameExam && isSameSchedule && isSameNotes) {
      throw new BadRequestException(
        'Change request must include at least one different value',
      );
    }

    const updated = await this.appointmentRepository.requestAppointmentChange({
      appointmentId: appointment.id,
      examId: targetExamId,
      scheduledAt: targetScheduledAt,
      notes: targetNotes,
    });

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    await this.messagingProvider.publish('appointments.change-requested', {
      appointmentId: updated.id,
      userId: updated.userId,
      requestedExamId: updated.requestedExamId,
      requestedScheduledAt: updated.requestedScheduledAt,
    });

    return updated;
  }
}
