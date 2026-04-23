import { Permission } from '@/domain/commons/enums/permission.enum';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import {
  CreateAppointmentUseCaseInput,
  ICreateAppointmentUseCase,
} from '@/domain/interfaces/use-cases/appointments/create-appointment.use-case';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CreateAppointmentUseCase implements ICreateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
  ) {}

  async execute(input: CreateAppointmentUseCaseInput) {
    if (input.scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    const exam = await this.examRepository.findById(input.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const conflict = await this.appointmentRepository.findExamScheduleConflict(
      input.examId,
      input.scheduledAt,
    );

    if (conflict) {
      throw new ConflictException('There is already an appointment for this exam/time slot');
    }

    const appointment = await this.appointmentRepository.createAppointment(input);

    await this.messagingProvider.publish('appointments.created', {
      appointmentId: appointment.id,
      userId: appointment.userId,
      examId: appointment.examId,
      permission: Permission.APPOINTMENTS_CREATE,
    });

    return appointment;
  }
}
