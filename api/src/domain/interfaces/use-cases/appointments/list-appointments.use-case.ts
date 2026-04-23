import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';

export interface IListAppointmentsUseCase {
  execute(
    user: AuthenticatedUser,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<AppointmentEntity>>;
}

export const IListAppointmentsUseCase = Symbol('IListAppointmentsUseCase');
