import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { AppointmentListQuery } from '@/domain/interfaces/repositories/appointment.repository';

export interface IListAppointmentsUseCase {
  execute(
    user: AuthenticatedUser,
    query: AppointmentListQuery,
  ): Promise<PaginatedResult<AppointmentEntity>>;
}

export const IListAppointmentsUseCase = Symbol('IListAppointmentsUseCase');
