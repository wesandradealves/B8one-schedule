import { ExamEntity } from '@/domain/entities/exam.entity';
import { PaginatedResult, PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { ExamListSortBy } from '@/domain/commons/enums/exam-list-sort-by.enum';

export interface ExamPaginationQuery extends PaginationQuery {
  sortBy?: ExamListSortBy;
}

export interface CreateExamInput {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceCents: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

export interface UpdateExamInput {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
  isActive?: boolean;
}

export interface IExamRepository {
  listActive(pagination: ExamPaginationQuery): Promise<PaginatedResult<ExamEntity>>;
  listAll(pagination: ExamPaginationQuery): Promise<PaginatedResult<ExamEntity>>;
  findById(id: string): Promise<ExamEntity | null>;
  findAnyById(id: string): Promise<ExamEntity | null>;
  createExam(input: CreateExamInput): Promise<ExamEntity>;
  updateExam(id: string, input: UpdateExamInput): Promise<ExamEntity | null>;
  deleteExam(id: string): Promise<boolean>;
}

export const IExamRepository = Symbol('IExamRepository');
