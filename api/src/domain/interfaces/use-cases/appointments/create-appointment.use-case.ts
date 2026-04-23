import { AppointmentEntity } from '@/domain/entities/appointment.entity';

export interface CreateAppointmentUseCaseInput {
  userId: string;
  examId: string;
  scheduledAt: Date;
  notes?: string;
}

export interface ICreateAppointmentUseCase {
  execute(input: CreateAppointmentUseCaseInput): Promise<AppointmentEntity>;
}

export const ICreateAppointmentUseCase = Symbol('ICreateAppointmentUseCase');
