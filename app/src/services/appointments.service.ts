import api from '@/services/api';
import type { PaginatedResult, PaginationQueryParams } from '@/types/api';
import type { Appointment } from '@/types/appointment';
import { executeRequest } from '@/utils/request';

interface CreateAppointmentPayload {
  examId: string;
  scheduledAt: string;
  notes?: string;
}

export const listAppointments = async (
  params: PaginationQueryParams = {},
): Promise<PaginatedResult<Appointment>> => {
  return executeRequest(() =>
    api.get<PaginatedResult<Appointment>>('/appointments/all', {
      params,
    }),
  );
};

export const createAppointment = async (
  payload: CreateAppointmentPayload,
): Promise<Appointment> => {
  return executeRequest(() => api.post<Appointment>('/appointments', payload));
};
