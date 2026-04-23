import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface ApproveAppointmentChangeUseCaseInput {
  appointmentId: string;
  user: AuthenticatedUser;
}

export interface IApproveAppointmentChangeUseCase {
  execute(input: ApproveAppointmentChangeUseCaseInput): Promise<AppointmentEntity>;
}

export const IApproveAppointmentChangeUseCase = Symbol(
  'IApproveAppointmentChangeUseCase',
);
