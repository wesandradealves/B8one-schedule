import { assertAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import {
  DeleteAppointmentUseCaseInput,
  IDeleteAppointmentUseCase,
} from '@/domain/interfaces/use-cases/appointments/delete-appointment.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class DeleteAppointmentUseCase implements IDeleteAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: DeleteAppointmentUseCaseInput): Promise<void> {
    assertAdmin(input.user, 'Only admin users can delete appointments');

    const appointment = await this.appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const deleted = await this.appointmentRepository.deleteAppointment(appointment.id);
    if (!deleted) {
      throw new NotFoundException('Appointment not found');
    }

    await this.messagingProvider.publish('appointments.deleted', {
      appointmentId: appointment.id,
      userId: appointment.userId,
      deletedByUserId: input.user.id,
    });
  }
}
