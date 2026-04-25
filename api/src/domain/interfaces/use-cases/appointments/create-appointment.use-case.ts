import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface CreateAppointmentUseCaseInput {
  user: AuthenticatedUser;
  examId: string;
  scheduledAt: Date;
  notes?: string;
}

export interface ICreateAppointmentUseCase {
  execute(input: CreateAppointmentUseCaseInput): Promise<AppointmentEntity>;
}

export const ICreateAppointmentUseCase = Symbol('ICreateAppointmentUseCase');
