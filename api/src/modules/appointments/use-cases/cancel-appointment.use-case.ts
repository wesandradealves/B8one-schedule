import { assertOwnerOrAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import {
  CancelAppointmentUseCaseInput,
  ICancelAppointmentUseCase,
} from '@/domain/interfaces/use-cases/appointments/cancel-appointment.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CancelAppointmentUseCase implements ICancelAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: CancelAppointmentUseCaseInput) {
    const appointment = await this.appointmentRepository.findById(input.appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    assertOwnerOrAdmin(input.user, appointment.userId, 'You can only cancel your own appointments');

    const cancelled = await this.appointmentRepository.cancelAppointment(appointment.id);
    if (!cancelled) {
      throw new NotFoundException('Appointment not found');
    }

    await this.messagingProvider.publish('appointments.cancelled', {
      appointmentId: cancelled.id,
      userId: cancelled.userId,
      cancelledByUserId: input.user.id,
    });

    return cancelled;
  }
}
