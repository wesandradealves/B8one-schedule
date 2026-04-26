import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import {
  isScheduledAtWithinExamAvailability,
  normalizeExamAvailability,
} from '@/domain/commons/utils/exam-availability.util';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  ApproveAppointmentChangeUseCaseInput,
  IApproveAppointmentChangeUseCase,
} from '@/domain/interfaces/use-cases/appointments/approve-appointment-change.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ApproveAppointmentChangeUseCase
  implements IApproveAppointmentChangeUseCase
{
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: ApproveAppointmentChangeUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can approve appointment changes');

    const appointment = await this.appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.changeStatus !== AppointmentChangeStatus.PENDING) {
      throw new BadRequestException('Appointment has no pending change request');
    }

    if (!appointment.requestedExamId || !appointment.requestedScheduledAt) {
      throw new BadRequestException('Appointment pending data is invalid');
    }

    if (appointment.requestedScheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Requested scheduled date must be in the future');
    }

    const exam = await this.examRepository.findById(appointment.requestedExamId);
    if (!exam) {
      throw new NotFoundException('Requested exam is no longer available');
    }

    const examAvailability = normalizeExamAvailability(exam);
    if (
      !isScheduledAtWithinExamAvailability(
        appointment.requestedScheduledAt,
        exam.durationMinutes,
        examAvailability,
      )
    ) {
      throw new BadRequestException(
        'Requested scheduled date is outside exam availability',
      );
    }

    const conflict = await this.appointmentRepository.findExamScheduleConflict(
      appointment.requestedExamId,
      appointment.requestedScheduledAt,
      appointment.id,
    );

    if (conflict) {
      throw new ConflictException('Requested date/time is no longer available');
    }

    const approved = await this.appointmentRepository.approveAppointmentChange({
      appointmentId: appointment.id,
      examId: appointment.requestedExamId,
      scheduledAt: appointment.requestedScheduledAt,
      notes: appointment.requestedNotes ?? null,
      reviewedByUserId: input.user.id,
      reviewedAt: new Date(),
    });

    if (!approved) {
      throw new NotFoundException('Appointment not found');
    }

    await this.messagingProvider.publish('appointments.change-approved', {
      appointmentId: approved.id,
      userId: approved.userId,
      reviewedByUserId: input.user.id,
    });

    return approved;
  }
}
