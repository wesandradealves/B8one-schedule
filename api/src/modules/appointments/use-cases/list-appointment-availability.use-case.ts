import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  IListAppointmentAvailabilityUseCase,
  ListAppointmentAvailabilityUseCaseInput,
} from '@/domain/interfaces/use-cases/appointments/list-appointment-availability.use-case';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ListAppointmentAvailabilityUseCase
  implements IListAppointmentAvailabilityUseCase
{
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
  ) {}

  async execute(input: ListAppointmentAvailabilityUseCaseInput) {
    if (input.startsAt.getTime() >= input.endsAt.getTime()) {
      throw new BadRequestException('"startsAt" must be before "endsAt"');
    }

    const exam = await this.examRepository.findById(input.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.appointmentRepository.listExamAvailability(
      input.examId,
      input.startsAt,
      input.endsAt,
    );
  }
}
