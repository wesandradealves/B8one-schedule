import api from '@/services/api';
import type { PaginatedResult, PaginationQueryParams } from '@/types/api';
import type { Exam } from '@/types/exam';
import { executeRequest } from '@/utils/request';

interface ListExamsParams extends PaginationQueryParams {
  search?: string;
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

export interface UpdateExamPayload {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
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
