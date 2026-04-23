import api from '@/services/api';
import type { PaginatedResult } from '@/types/api';
import type { Exam } from '@/types/exam';

interface ListExamsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const listExams = async (
  params: ListExamsParams = {},
): Promise<PaginatedResult<Exam>> => {
  const response = await api.get<PaginatedResult<Exam>>('/exams/all', {
    params,
  });

  return response.data;
};

export const getExamById = async (id: string): Promise<Exam> => {
  const response = await api.get<Exam>(`/exams/${id}`);
  return response.data;
};
