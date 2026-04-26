import { ExamEntity } from '@/domain/entities/exam.entity';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';
import { ExamListSortBy } from '@/domain/commons/enums/exam-list-sort-by.enum';
import {
  DEFAULT_EXAM_AVAILABLE_END_TIME,
  DEFAULT_EXAM_AVAILABLE_START_TIME,
  DEFAULT_EXAM_AVAILABLE_WEEKDAYS,
} from '@/domain/commons/utils/exam-availability.util';
import {
  CreateExamInput,
  ExamPaginationQuery,
  IExamRepository,
  UpdateExamInput,
} from '@/domain/interfaces/repositories/exam.repository';
import { PaginatedResult } from '@/domain/commons/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExamRepository implements IExamRepository {
  constructor(
    @InjectRepository(ExamEntity)
    private readonly repository: Repository<ExamEntity>,
  ) {}

  async findById(id: string): Promise<ExamEntity | null> {
    return this.repository
      .createQueryBuilder('exam')
      .where('exam.id = :id', { id })
      .andWhere('exam.isActive = :isActive', { isActive: true })
      .getOne();
  }

  async findAnyById(id: string): Promise<ExamEntity | null> {
    return this.repository
      .createQueryBuilder('exam')
      .where('exam.id = :id', { id })
      .getOne();
  }

  async listActive(pagination: ExamPaginationQuery): Promise<PaginatedResult<ExamEntity>> {
    const sortOrder = pagination.sortOrder ?? SortOrder.DESC;
    const sortBy = pagination.sortBy ?? ExamListSortBy.CREATED_AT;

    const queryBuilder = this.repository
      .createQueryBuilder('exam')
      .where('exam.isActive = :isActive', { isActive: true });

    this.applyListSorting(queryBuilder, sortBy, sortOrder);

    const [data, total] = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    return {
      data,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
    };
  }

  async listAll(pagination: ExamPaginationQuery): Promise<PaginatedResult<ExamEntity>> {
    const sortOrder = pagination.sortOrder ?? SortOrder.DESC;
    const sortBy = pagination.sortBy ?? ExamListSortBy.CREATED_AT;

    const queryBuilder = this.repository.createQueryBuilder('exam');

    this.applyListSorting(queryBuilder, sortBy, sortOrder);

    const [data, total] = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    return {
      data,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
    };
  }

  async createExam(input: CreateExamInput): Promise<ExamEntity> {
    const insertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .into(ExamEntity)
      .values({
        name: input.name.trim(),
        description: input.description ?? null,
        durationMinutes: input.durationMinutes,
        priceCents: input.priceCents,
        availableWeekdays:
          input.availableWeekdays ?? [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
        availableStartTime:
          input.availableStartTime ?? DEFAULT_EXAM_AVAILABLE_START_TIME,
        availableEndTime:
          input.availableEndTime ?? DEFAULT_EXAM_AVAILABLE_END_TIME,
        availableFromDate: input.availableFromDate ?? null,
        availableToDate: input.availableToDate ?? null,
        isActive: true,
      })
      .returning('id')
      .execute();

    const examId = String(insertResult.identifiers[0]?.id);

    return this.repository
      .createQueryBuilder('exam')
      .where('exam.id = :examId', { examId })
      .getOneOrFail();
  }

  async updateExam(id: string, input: UpdateExamInput): Promise<ExamEntity | null> {
    const payload: Partial<ExamEntity> = {};

    if (input.name !== undefined) {
      payload.name = input.name.trim();
    }
    if (input.description !== undefined) {
      payload.description = input.description;
    }
    if (input.durationMinutes !== undefined) {
      payload.durationMinutes = input.durationMinutes;
    }
    if (input.priceCents !== undefined) {
      payload.priceCents = input.priceCents;
    }
    if (input.availableWeekdays !== undefined) {
      payload.availableWeekdays = input.availableWeekdays;
    }
    if (input.availableStartTime !== undefined) {
      payload.availableStartTime = input.availableStartTime;
    }
    if (input.availableEndTime !== undefined) {
      payload.availableEndTime = input.availableEndTime;
    }
    if (input.availableFromDate !== undefined) {
      payload.availableFromDate = input.availableFromDate;
    }
    if (input.availableToDate !== undefined) {
      payload.availableToDate = input.availableToDate;
    }
    if (input.isActive !== undefined) {
      payload.isActive = input.isActive;
    }

    if (Object.keys(payload).length === 0) {
      return this.repository
        .createQueryBuilder('exam')
        .where('exam.id = :id', { id })
        .getOne();
    }

    await this.repository
      .createQueryBuilder()
      .update(ExamEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    return this.repository
      .createQueryBuilder('exam')
      .where('exam.id = :id', { id })
      .getOne();
  }

  async deleteExam(id: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ExamEntity)
      .set({ isActive: false })
      .where('id = :id', { id })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  private applyListSorting(
    queryBuilder: ReturnType<Repository<ExamEntity>['createQueryBuilder']>,
    sortBy: ExamListSortBy,
    sortOrder: SortOrder,
  ): void {
    if (sortBy === ExamListSortBy.PRICE_CENTS) {
      queryBuilder
        .orderBy('exam.priceCents', sortOrder)
        .addOrderBy('exam.createdAt', sortOrder)
        .addOrderBy('exam.id', sortOrder);
      return;
    }

    queryBuilder
      .orderBy('exam.createdAt', sortOrder)
      .addOrderBy('exam.id', sortOrder);
  }
}
