import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface UpdateAppointmentUseCaseInput {
  appointmentId: string;
  user: AuthenticatedUser;
  examId?: string;
  scheduledAt?: Date;
  notes?: string | null;
  status?: AppointmentStatus;
}

export interface IUpdateAppointmentUseCase {
  execute(input: UpdateAppointmentUseCaseInput): Promise<AppointmentEntity>;
}

export const IUpdateAppointmentUseCase = Symbol('IUpdateAppointmentUseCase');
