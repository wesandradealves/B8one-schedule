import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { Permission } from '@/domain/commons/enums/permission.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { ICreateAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/create-appointment.use-case';
import { IListAppointmentsUseCase } from '@/domain/interfaces/use-cases/appointments/list-appointments.use-case';
import { ICancelAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/cancel-appointment.use-case';
import { IRequestAppointmentChangeUseCase } from '@/domain/interfaces/use-cases/appointments/request-appointment-change.use-case';
import { IApproveAppointmentChangeUseCase } from '@/domain/interfaces/use-cases/appointments/approve-appointment-change.use-case';
import { IUpdateAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/update-appointment.use-case';
import { IDeleteAppointmentUseCase } from '@/domain/interfaces/use-cases/appointments/delete-appointment.use-case';
import { IGetAppointmentByIdUseCase } from '@/domain/interfaces/use-cases/appointments/get-appointment-by-id.use-case';
import { IImportAppointmentsCsvUseCase } from '@/domain/interfaces/use-cases/appointments/import-appointments-csv.use-case';
import { IExportAppointmentsCsvUseCase } from '@/domain/interfaces/use-cases/appointments/export-appointments-csv.use-case';
import { CurrentUser } from '@/infrastructure/http/decorators/current-user.decorator';
import { Permissions } from '@/infrastructure/http/decorators/permissions.decorator';
import { Profiles } from '@/infrastructure/http/decorators/profiles.decorator';
import { JwtAuthGuard } from '@/infrastructure/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/infrastructure/http/guards/permissions.guard';
import { ProfileGuard } from '@/infrastructure/http/guards/profile.guard';
import { ZodValidationPipe } from '@/infrastructure/http/pipes/zod.validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentResponseDto } from '../dto/appointment.response.dto';
import { CreateAppointmentRequestDto } from '../dto/create-appointment.request.dto';
import { ListAppointmentsResponseDto } from '../dto/list-appointments.response.dto';
import { RequestAppointmentChangeRequestDto } from '../dto/request-appointment-change.request.dto';
import { UpdateAppointmentRequestDto } from '../dto/update-appointment.request.dto';
import { CsvImportRequestDto } from '@/modules/shared/dto/csv-import.request.dto';
import { CsvImportResponseDto } from '@/modules/shared/dto/csv-import.response.dto';
import { CsvExportResponseDto } from '@/modules/shared/dto/csv-export.response.dto';
import {
  PaginationQuerySchemaType,
  paginationQuerySchema,
} from '@/modules/shared/utils/pagination-query.schema';
import {
  CsvImportSchemaType,
  csvImportSchema,
} from '@/modules/shared/utils/csv-import.schema';
import { appointmentIdParamSchema } from '../schemas/appointment-id-param.schema';
import { createAppointmentSchema } from '../schemas/create-appointment.schema';
import { requestAppointmentChangeSchema } from '../schemas/request-appointment-change.schema';
import { updateAppointmentSchema } from '../schemas/update-appointment.schema';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, ProfileGuard, PermissionsGuard)
@Profiles(UserProfile.ADMIN, UserProfile.CLIENT)
export class AppointmentsController {
  constructor(
    @Inject(ICreateAppointmentUseCase)
    private readonly createAppointmentUseCase: ICreateAppointmentUseCase,
    @Inject(IListAppointmentsUseCase)
    private readonly listAppointmentsUseCase: IListAppointmentsUseCase,
    @Inject(IGetAppointmentByIdUseCase)
    private readonly getAppointmentByIdUseCase: IGetAppointmentByIdUseCase,
    @Inject(ICancelAppointmentUseCase)
    private readonly cancelAppointmentUseCase: ICancelAppointmentUseCase,
    @Inject(IRequestAppointmentChangeUseCase)
    private readonly requestAppointmentChangeUseCase: IRequestAppointmentChangeUseCase,
    @Inject(IApproveAppointmentChangeUseCase)
    private readonly approveAppointmentChangeUseCase: IApproveAppointmentChangeUseCase,
    @Inject(IUpdateAppointmentUseCase)
    private readonly updateAppointmentUseCase: IUpdateAppointmentUseCase,
    @Inject(IDeleteAppointmentUseCase)
    private readonly deleteAppointmentUseCase: IDeleteAppointmentUseCase,
    @Inject(IImportAppointmentsCsvUseCase)
    private readonly importAppointmentsCsvUseCase: IImportAppointmentsCsvUseCase,
    @Inject(IExportAppointmentsCsvUseCase)
    private readonly exportAppointmentsCsvUseCase: IExportAppointmentsCsvUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @Permissions(Permission.APPOINTMENTS_CREATE)
  @ApiOperation({ summary: 'Create appointment for an exam with conflict validation' })
  @ApiBody({ type: CreateAppointmentRequestDto })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createAppointmentSchema))
    payload: { examId: string; scheduledAt: Date; notes?: string },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.createAppointmentUseCase.execute({
      userId: user.id,
      examId: payload.examId,
      scheduledAt: payload.scheduledAt,
      notes: payload.notes,
    });

    return this.toResponse(appointment);
  }

  @Post('import/csv')
  @Permissions(Permission.APPOINTMENTS_IMPORT_CSV)
  @HttpCode(200)
  @ApiOperation({ summary: 'Import appointments from CSV (admin only)' })
  @ApiBody({ type: CsvImportRequestDto })
  @ApiResponse({ status: 200, type: CsvImportResponseDto })
  async importCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(csvImportSchema))
    payload: CsvImportSchemaType,
  ): Promise<CsvImportResponseDto> {
    return this.importAppointmentsCsvUseCase.execute({
      user,
      csvContent: payload.csvContent,
    });
  }

  @Get('export/csv')
  @Permissions(Permission.APPOINTMENTS_EXPORT_CSV)
  @ApiOperation({ summary: 'Export appointments to CSV (admin only)' })
  @ApiResponse({ status: 200, type: CsvExportResponseDto })
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CsvExportResponseDto> {
    return this.exportAppointmentsCsvUseCase.execute({ user });
  }

  @Get('all')
  @Permissions(Permission.APPOINTMENTS_READ_OWN)
  @ApiOperation({ summary: 'List appointments (admin: all, client: own)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: ListAppointmentsResponseDto })
  async listAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    pagination: PaginationQuerySchemaType,
  ): Promise<ListAppointmentsResponseDto> {
    const result = await this.listAppointmentsUseCase.execute(user, pagination);

    return {
      ...result,
      data: result.data.map((appointment) => this.toResponse(appointment)),
    };
  }

  @Get(':id')
  @Permissions(Permission.APPOINTMENTS_READ_OWN)
  @ApiOperation({ summary: 'Get appointment by id (admin: any, client: own)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.getAppointmentByIdUseCase.execute({
      id: params.id,
      user,
    });

    return this.toResponse(appointment);
  }

  @Patch(':id/cancel')
  @Permissions(Permission.APPOINTMENTS_CANCEL_OWN)
  @ApiOperation({ summary: 'Cancel appointment (own appointment or admin)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.cancelAppointmentUseCase.execute({
      appointmentId: params.id,
      user,
    });

    return this.toResponse(appointment);
  }

  @Patch(':id/request-change')
  @Permissions(Permission.APPOINTMENTS_REQUEST_CHANGE_OWN)
  @ApiOperation({
    summary:
      'Request appointment change (client flow requires admin approval before applying)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: RequestAppointmentChangeRequestDto })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async requestChange(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(requestAppointmentChangeSchema))
    payload: { examId?: string; scheduledAt?: Date; notes?: string | null },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.requestAppointmentChangeUseCase.execute({
      appointmentId: params.id,
      user,
      examId: payload.examId,
      scheduledAt: payload.scheduledAt,
      notes: payload.notes,
    });

    return this.toResponse(appointment);
  }

  @Patch(':id/approve-change')
  @Permissions(Permission.APPOINTMENTS_APPROVE_CHANGE)
  @ApiOperation({ summary: 'Approve pending appointment change (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async approveChange(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.approveAppointmentChangeUseCase.execute({
      appointmentId: params.id,
      user,
    });

    return this.toResponse(appointment);
  }

  @Patch(':id')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  @ApiOperation({ summary: 'Update appointment directly (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateAppointmentRequestDto })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(updateAppointmentSchema))
    payload: {
      examId?: string;
      scheduledAt?: Date;
      notes?: string | null;
      status?: AppointmentEntity['status'];
    },
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.updateAppointmentUseCase.execute({
      appointmentId: params.id,
      user,
      examId: payload.examId,
      scheduledAt: payload.scheduledAt,
      notes: payload.notes,
      status: payload.status,
    });

    return this.toResponse(appointment);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(Permission.APPOINTMENTS_DELETE)
  @ApiOperation({ summary: 'Delete appointment (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(appointmentIdParamSchema))
    params: { id: string },
  ): Promise<void> {
    await this.deleteAppointmentUseCase.execute({
      appointmentId: params.id,
      user,
    });
  }

  private toResponse(appointment: AppointmentEntity): AppointmentResponseDto {
    return {
      id: appointment.id,
      examId: appointment.examId,
      userId: appointment.userId,
      examName: appointment.exam?.name ?? '',
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      notes: appointment.notes,
      changeStatus: appointment.changeStatus,
      requestedExamId: appointment.requestedExamId,
      requestedExamName: appointment.requestedExam?.name ?? null,
      requestedScheduledAt: appointment.requestedScheduledAt,
      requestedNotes: appointment.requestedNotes,
      userFullName: appointment.user?.fullName,
      userEmail: appointment.user?.email,
    };
  }
}
