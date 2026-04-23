import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  IUpdateAppointmentUseCase,
  UpdateAppointmentUseCaseInput,
} from '@/domain/interfaces/use-cases/appointments/update-appointment.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UpdateAppointmentUseCase implements IUpdateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: UpdateAppointmentUseCaseInput) {
    assertAdmin(input.user, 'Only admin users can update appointments');

    const appointment = await this.appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const targetStatus = input.status ?? appointment.status;
    const targetExamId = input.examId ?? appointment.examId;
    const targetScheduledAt = input.scheduledAt ?? appointment.scheduledAt;
    const targetNotes = input.notes ?? appointment.notes ?? null;

    if (targetStatus === AppointmentStatus.SCHEDULED) {
      if (targetScheduledAt.getTime() <= Date.now()) {
        throw new BadRequestException('Scheduled date must be in the future');
      }

      const exam = await this.examRepository.findById(targetExamId);
      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      const conflict = await this.appointmentRepository.findExamScheduleConflict(
        targetExamId,
        targetScheduledAt,
        appointment.id,
      );

      if (conflict) {
        throw new ConflictException('There is already an appointment for this exam/time slot');
      }
    }

    if (targetStatus === AppointmentStatus.CANCELLED) {
      const cancelled = await this.appointmentRepository.cancelAppointment(appointment.id);

      if (!cancelled) {
        throw new NotFoundException('Appointment not found');
      }

      await this.messagingProvider.publish('appointments.updated', {
        appointmentId: cancelled.id,
        userId: cancelled.userId,
        updatedByUserId: input.user.id,
      });

      return cancelled;
    }

    const updated = await this.appointmentRepository.updateAppointment(appointment.id, {
      examId: targetExamId,
      scheduledAt: targetScheduledAt,
      notes: targetNotes,
      status: targetStatus,
    });

    if (!updated) {
      throw new NotFoundException('Appointment not found');
    }

    await this.appointmentRepository.clearChangeRequest(
      updated.id,
      AppointmentChangeStatus.NONE,
    );

    const updatedAfterClear = await this.appointmentRepository.findById(updated.id);
    if (!updatedAfterClear) {
      throw new NotFoundException('Appointment not found');
    }

    await this.messagingProvider.publish('appointments.updated', {
      appointmentId: updatedAfterClear.id,
      userId: updatedAfterClear.userId,
      updatedByUserId: input.user.id,
    });

    return updatedAfterClear;
  }
}
