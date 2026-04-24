import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/appointment.repository';
import { IApproveAppointmentChangeUseCase } from '@/domain/interfaces/use-cases/appointments/approve-appointment-change.use-case';
import { ICancelAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/cancel-appointment.use-case';
import { ICreateAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/create-appointment.use-case';
import { IDeleteAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/delete-appointment.use-case';
import { IGetAppointmentByIdUseCase } from '@/domain/interfaces/use-cases/appointments/get-appointment-by-id.use-case';
import { IListAppointmentsUseCase } from '@/domain/interfaces/use-cases/appointments/list-appointments.use-case';
import { IRequestAppointmentChangeUseCase } from '@/domain/interfaces/use-cases/appointments/request-appointment-change.use-case';
import { IUpdateAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/update-appointment.use-case';
import { IImportAppointmentsCsvUseCase } from '@/domain/interfaces/use-cases/appointments/import-appointments-csv.use-case';
import { IExportAppointmentsCsvUseCase } from '@/domain/interfaces/use-cases/appointments/export-appointments-csv.use-case';
import { BullMqMessagingModule } from '@/infrastructure/providers/messaging/bullmq/bullmq.module';
import { AppointmentRepository } from '@/infrastructure/repositories/appointment.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsModule } from '../exams/exams.module';
import { SharedModule } from '../shared/shared.module';
import { AppointmentsController } from './api/controllers/appointments.controller';
import { ApproveAppointmentChangeUseCase } from './use-cases/approve-appointment-change.use-case';
import { CancelAppointmentUseCase } from './use-cases/cancel-appointment.use-case';
import { CreateAppointmentUseCase } from './use-cases/create-appointment.use-case';
import { DeleteAppointmentUseCase } from './use-cases/delete-appointment.use-case';
import { GetAppointmentByIdUseCase } from './use-cases/get-appointment-by-id.use-case';
import { ListAppointmentsUseCase } from './use-cases/list-appointments.use-case';
import { RequestAppointmentChangeUseCase } from './use-cases/request-appointment-change.use-case';
import { UpdateAppointmentUseCase } from './use-cases/update-appointment.use-case';
import { ImportAppointmentsCsvUseCase } from './use-cases/import-appointments-csv.use-case';
import { ExportAppointmentsCsvUseCase } from './use-cases/export-appointments-csv.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity]),
    SharedModule,
    BullMqMessagingModule,
    ExamsModule,
    UsersModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    {
      provide: IAppointmentRepository,
      useClass: AppointmentRepository,
    },
    {
      provide: ICreateAppointmentUseCase,
      useClass: CreateAppointmentUseCase,
    },
    {
      provide: IListAppointmentsUseCase,
      useClass: ListAppointmentsUseCase,
    },
    {
      provide: IGetAppointmentByIdUseCase,
      useClass: GetAppointmentByIdUseCase,
    },
    {
      provide: ICancelAppointmentUseCase,
      useClass: CancelAppointmentUseCase,
    },
    {
      provide: IRequestAppointmentChangeUseCase,
      useClass: RequestAppointmentChangeUseCase,
    },
    {
      provide: IApproveAppointmentChangeUseCase,
      useClass: ApproveAppointmentChangeUseCase,
    },
    {
      provide: IUpdateAppointmentUseCase,
      useClass: UpdateAppointmentUseCase,
    },
    {
      provide: IDeleteAppointmentUseCase,
      useClass: DeleteAppointmentUseCase,
    },
    {
      provide: IImportAppointmentsCsvUseCase,
      useClass: ImportAppointmentsCsvUseCase,
    },
    {
      provide: IExportAppointmentsCsvUseCase,
      useClass: ExportAppointmentsCsvUseCase,
    },
  ],
})
export class AppointmentsModule {}
