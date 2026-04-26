import api from '@/services/api';
import type {
  CsvExportResult,
  CsvImportResult,
  PaginatedResult,
  PaginationQueryParams,
} from '@/types/api';
import type { CreateExamPayload, Exam, ExamListSortBy } from '@/types/exam';
import { executeRequest } from '@/utils/request';

interface ListExamsParams extends PaginationQueryParams {
  search?: string;
  sortBy?: ExamListSortBy;
}

export const listExams = async (
  params: ListExamsParams = {},
): Promise<PaginatedResult<Exam>> => {
  return executeRequest(() =>
    api.get<PaginatedResult<Exam>>('/exams/all', {
      params,
    }),
  );
};

export const getExamById = async (id: string): Promise<Exam> => {
  return executeRequest(() => api.get<Exam>(`/exams/${id}`));
};

export const createExam = async (payload: CreateExamPayload): Promise<Exam> => {
  return executeRequest(() => api.post<Exam>('/exams', payload));
};

export interface UpdateExamPayload {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

export const updateExamById = async (
  id: string,
  payload: UpdateExamPayload,
): Promise<Exam> => {
  return executeRequest(() => api.patch<Exam>(`/exams/${id}`, payload));
};

export const deleteExamById = async (id: string): Promise<void> => {
  await executeRequest(() => api.delete<void>(`/exams/${id}`));
};

export const importExamsCsv = async (csvContent: string): Promise<CsvImportResult> => {
  return executeRequest(() =>
    api.post<CsvImportResult>('/exams/import/csv', {
      csvContent,
    }),
  );
};

export const exportExamsCsv = async (): Promise<CsvExportResult> => {
  return executeRequest(() => api.get<CsvExportResult>('/exams/export/csv'));
};
