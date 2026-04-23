import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface GetAppointmentByIdUseCaseInput {
  id: string;
  user: AuthenticatedUser;
}

export interface IGetAppointmentByIdUseCase {
  execute(input: GetAppointmentByIdUseCaseInput): Promise<AppointmentEntity>;
}

export const IGetAppointmentByIdUseCase = Symbol('IGetAppointmentByIdUseCase');
