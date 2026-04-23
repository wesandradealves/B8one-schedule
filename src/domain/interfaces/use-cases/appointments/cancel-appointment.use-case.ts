import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface CancelAppointmentUseCaseInput {
  appointmentId: string;
  user: AuthenticatedUser;
}

export interface ICancelAppointmentUseCase {
  execute(input: CancelAppointmentUseCaseInput): Promise<AppointmentEntity>;
}

export const ICancelAppointmentUseCase = Symbol('ICancelAppointmentUseCase');
