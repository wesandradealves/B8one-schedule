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
