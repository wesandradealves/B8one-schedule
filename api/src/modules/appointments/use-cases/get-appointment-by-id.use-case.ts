import { assertOwnerOrAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import {
  GetAppointmentByIdUseCaseInput,
  IGetAppointmentByIdUseCase,
} from '@/domain/interfaces/use-cases/appointments/get-appointment-by-id.use-case';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetAppointmentByIdUseCase implements IGetAppointmentByIdUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: GetAppointmentByIdUseCaseInput) {
    const appointment = await this.appointmentRepository.findById(input.id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    assertOwnerOrAdmin(input.user, appointment.userId, 'You can only access your own appointments');

    return appointment;
  }
}
