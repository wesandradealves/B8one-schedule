import { ExamEntity } from '@/domain/entities/exam.entity';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';

export interface CreateExamInput {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceCents: number;
}

export interface UpdateExamInput {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  isActive?: boolean;
}

export interface IExamRepository {
  listActive(pagination: PaginationQuery): Promise<PaginatedResult<ExamEntity>>;
  listAll(pagination: PaginationQuery): Promise<PaginatedResult<ExamEntity>>;
  findById(id: string): Promise<ExamEntity | null>;
  findAnyById(id: string): Promise<ExamEntity | null>;
  createExam(input: CreateExamInput): Promise<ExamEntity>;
  updateExam(id: string, input: UpdateExamInput): Promise<ExamEntity | null>;
  deleteExam(id: string): Promise<boolean>;
}

export const IExamRepository = Symbol('IExamRepository');
