import { AppointmentEntity } from '@/domain/entities/appointment.entity';

export interface ListAppointmentAvailabilityUseCaseInput {
  examId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface IListAppointmentAvailabilityUseCase {
  execute(
    input: ListAppointmentAvailabilityUseCaseInput,
  ): Promise<AppointmentEntity[]>;
}

export const IListAppointmentAvailabilityUseCase = Symbol(
  'IListAppointmentAvailabilityUseCase',
);
