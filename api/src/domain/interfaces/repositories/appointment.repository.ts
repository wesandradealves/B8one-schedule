import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';

export interface AppointmentListQuery extends PaginationQuery {
  scheduledDate?: string;
}

export interface CreateAppointmentInput {
  userId: string;
  examId: string;
  scheduledAt: Date;
  notes?: string;
}

export interface UpdateAppointmentInput {
  examId?: string;
  scheduledAt?: Date;
  notes?: string | null;
  status?: AppointmentStatus;
}

export interface RequestAppointmentChangeInput {
  appointmentId: string;
  examId: string;
  scheduledAt: Date;
  notes?: string | null;
}

export interface ApproveAppointmentChangeInput {
  appointmentId: string;
  examId: string;
  scheduledAt: Date;
  notes?: string | null;
  reviewedByUserId: string;
  reviewedAt: Date;
}

export interface IAppointmentRepository {
  findById(id: string): Promise<AppointmentEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<AppointmentEntity | null>;
  findExamScheduleConflict(
    examId: string,
    scheduledAt: Date,
    excludeAppointmentId?: string,
  ): Promise<AppointmentEntity | null>;
  createAppointment(input: CreateAppointmentInput): Promise<AppointmentEntity>;
  updateAppointment(id: string, input: UpdateAppointmentInput): Promise<AppointmentEntity | null>;
  cancelAppointment(id: string): Promise<AppointmentEntity | null>;
  requestAppointmentChange(input: RequestAppointmentChangeInput): Promise<AppointmentEntity | null>;
  approveAppointmentChange(input: ApproveAppointmentChangeInput): Promise<AppointmentEntity | null>;
  deleteAppointment(id: string): Promise<boolean>;
  listByUserId(
    userId: string,
    query: AppointmentListQuery,
  ): Promise<PaginatedResult<AppointmentEntity>>;
  listAll(query: AppointmentListQuery): Promise<PaginatedResult<AppointmentEntity>>;
  clearChangeRequest(id: string, status: AppointmentChangeStatus): Promise<void>;
}

export const IAppointmentRepository = Symbol('IAppointmentRepository');
