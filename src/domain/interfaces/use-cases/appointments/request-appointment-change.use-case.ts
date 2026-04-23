import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface RequestAppointmentChangeUseCaseInput {
  appointmentId: string;
  user: AuthenticatedUser;
  examId?: string;
  scheduledAt?: Date;
  notes?: string | null;
}

export interface IRequestAppointmentChangeUseCase {
  execute(input: RequestAppointmentChangeUseCaseInput): Promise<AppointmentEntity>;
}

export const IRequestAppointmentChangeUseCase = Symbol(
  'IRequestAppointmentChangeUseCase',
);
