import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface DeleteAppointmentUseCaseInput {
  appointmentId: string;
  user: AuthenticatedUser;
}

export interface IDeleteAppointmentUseCase {
  execute(input: DeleteAppointmentUseCaseInput): Promise<void>;
}

export const IDeleteAppointmentUseCase = Symbol('IDeleteAppointmentUseCase');
