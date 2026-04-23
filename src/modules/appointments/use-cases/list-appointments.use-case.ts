import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IListAppointmentsUseCase } from '@/domain/interfaces/use-cases/appointments/list-appointments.use-case';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListAppointmentsUseCase implements IListAppointmentsUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(user: AuthenticatedUser, pagination: PaginationQuery) {
    if (isAdmin(user)) {
      return this.appointmentRepository.listAll(pagination);
    }

    return this.appointmentRepository.listByUserId(user.id, pagination);
  }
}
