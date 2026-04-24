import { ExamEntity } from '@/domain/entities/exam.entity';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';
import {
  CreateExamInput,
  IExamRepository,
  UpdateExamInput,
} from '@/domain/interfaces/repositories/exam.repository';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
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

  async listActive(pagination: PaginationQuery): Promise<PaginatedResult<ExamEntity>> {
    const sortOrder = pagination.sortOrder ?? SortOrder.DESC;

    const [data, total] = await this.repository
      .createQueryBuilder('exam')
      .where('exam.isActive = :isActive', { isActive: true })
      .orderBy('exam.createdAt', sortOrder)
      .addOrderBy('exam.id', sortOrder)
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

  async listAll(pagination: PaginationQuery): Promise<PaginatedResult<ExamEntity>> {
    const sortOrder = pagination.sortOrder ?? SortOrder.DESC;

    const [data, total] = await this.repository
      .createQueryBuilder('exam')
      .orderBy('exam.createdAt', sortOrder)
      .addOrderBy('exam.id', sortOrder)
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
}
