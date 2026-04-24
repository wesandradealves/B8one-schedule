import {
  ApproveAppointmentChangeInput,
  AppointmentListQuery,
  CreateAppointmentInput,
  IAppointmentRepository,
  RequestAppointmentChangeInput,
  UpdateAppointmentInput,
} from '@/domain/interfaces/repositories/appointment.repository';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { AppointmentChangeStatus } from '@/domain/commons/enums/appointment-change-status.enum';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly repository: Repository<AppointmentEntity>,
  ) {}

  async findById(id: string): Promise<AppointmentEntity | null> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.exam', 'exam')
      .leftJoinAndSelect('appointment.requestedExam', 'requestedExam')
      .where('appointment.id = :id', { id })
      .getOne();
  }

  async findByIdAndUserId(id: string, userId: string): Promise<AppointmentEntity | null> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.exam', 'exam')
      .leftJoinAndSelect('appointment.requestedExam', 'requestedExam')
      .where('appointment.id = :id', { id })
      .andWhere('appointment.userId = :userId', { userId })
      .getOne();
  }

  async findExamScheduleConflict(
    examId: string,
    scheduledAt: Date,
    excludeAppointmentId?: string,
  ): Promise<AppointmentEntity | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .where('appointment.examId = :examId', { examId })
      .andWhere('appointment.scheduledAt = :scheduledAt', {
        scheduledAt: scheduledAt.toISOString(),
      })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.SCHEDULED,
      });

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id <> :excludeAppointmentId', {
        excludeAppointmentId,
      });
    }

    return queryBuilder.getOne();
  }

  async createAppointment(input: CreateAppointmentInput): Promise<AppointmentEntity> {
    const insertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .into(AppointmentEntity)
      .values({
        userId: input.userId,
        examId: input.examId,
        scheduledAt: input.scheduledAt,
        notes: input.notes ?? null,
        status: AppointmentStatus.SCHEDULED,
        changeStatus: AppointmentChangeStatus.NONE,
      })
      .returning('id')
      .execute();

    const appointmentId = String(insertResult.identifiers[0]?.id);
    return this.findByIdOrFail(appointmentId);
  }

  async updateAppointment(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<AppointmentEntity | null> {
    const payload: Partial<AppointmentEntity> = {};

    if (input.examId !== undefined) {
      payload.examId = input.examId;
    }
    if (input.scheduledAt !== undefined) {
      payload.scheduledAt = input.scheduledAt;
    }
    if (input.notes !== undefined) {
      payload.notes = input.notes;
    }
    if (input.status !== undefined) {
      payload.status = input.status;
    }

    if (Object.keys(payload).length === 0) {
      return this.findById(id);
    }

    await this.repository
      .createQueryBuilder()
      .update(AppointmentEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    return this.findById(id);
  }

  async cancelAppointment(id: string): Promise<AppointmentEntity | null> {
    await this.repository
      .createQueryBuilder()
      .update(AppointmentEntity)
      .set({
        status: AppointmentStatus.CANCELLED,
        changeStatus: AppointmentChangeStatus.NONE,
        requestedExamId: null,
        requestedScheduledAt: null,
        requestedNotes: null,
      })
      .where('id = :id', { id })
      .execute();

    return this.findById(id);
  }

  async requestAppointmentChange(
    input: RequestAppointmentChangeInput,
  ): Promise<AppointmentEntity | null> {
    await this.repository
      .createQueryBuilder()
      .update(AppointmentEntity)
      .set({
        requestedExamId: input.examId,
        requestedScheduledAt: input.scheduledAt,
        requestedNotes: input.notes ?? null,
        changeStatus: AppointmentChangeStatus.PENDING,
      })
      .where('id = :id', { id: input.appointmentId })
      .execute();

    return this.findById(input.appointmentId);
  }

  async approveAppointmentChange(
    input: ApproveAppointmentChangeInput,
  ): Promise<AppointmentEntity | null> {
    await this.repository
      .createQueryBuilder()
      .update(AppointmentEntity)
      .set({
        examId: input.examId,
        scheduledAt: input.scheduledAt,
        notes: input.notes ?? null,
        changeStatus: AppointmentChangeStatus.NONE,
        requestedExamId: null,
        requestedScheduledAt: null,
        requestedNotes: null,
        reviewedByUserId: input.reviewedByUserId,
        reviewedAt: input.reviewedAt,
      })
      .where('id = :id', { id: input.appointmentId })
      .execute();

    return this.findById(input.appointmentId);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(AppointmentEntity)
      .where('id = :id', { id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async listByUserId(
    userId: string,
    query: AppointmentListQuery,
  ): Promise<PaginatedResult<AppointmentEntity>> {
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.exam', 'exam')
      .leftJoinAndSelect('appointment.requestedExam', 'requestedExam')
      .where('appointment.userId = :userId', { userId })
      .orderBy('appointment.scheduledAt', sortOrder)
      .addOrderBy('appointment.id', sortOrder);

    this.applyScheduledDateFilter(queryBuilder, query.scheduledDate);

    const [data, total] = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      data,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async listAll(query: AppointmentListQuery): Promise<PaginatedResult<AppointmentEntity>> {
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.exam', 'exam')
      .leftJoinAndSelect('appointment.requestedExam', 'requestedExam')
      .leftJoinAndSelect('appointment.user', 'user')
      .orderBy('appointment.scheduledAt', sortOrder)
      .addOrderBy('appointment.id', sortOrder);

    this.applyScheduledDateFilter(queryBuilder, query.scheduledDate);

    const [data, total] = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      data,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async clearChangeRequest(id: string, status: AppointmentChangeStatus): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(AppointmentEntity)
      .set({
        changeStatus: status,
        requestedExamId: null,
        requestedScheduledAt: null,
        requestedNotes: null,
      })
      .where('id = :id', { id })
      .execute();
  }

  private async findByIdOrFail(id: string): Promise<AppointmentEntity> {
    return this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.exam', 'exam')
      .leftJoinAndSelect('appointment.requestedExam', 'requestedExam')
      .where('appointment.id = :id', { id })
      .getOneOrFail();
  }

  private applyScheduledDateFilter(
    queryBuilder: ReturnType<Repository<AppointmentEntity>['createQueryBuilder']>,
    scheduledDate?: string,
  ): void {
    if (!scheduledDate) {
      return;
    }

    const start = new Date(`${scheduledDate}T00:00:00.000Z`);
    const end = new Date(`${scheduledDate}T23:59:59.999Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }

    queryBuilder.andWhere('appointment.scheduledAt BETWEEN :start AND :end', {
      start,
      end,
    });
  }
}
