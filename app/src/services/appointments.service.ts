import api from '@/services/api';
import type { PaginatedResult, PaginationQueryParams } from '@/types/api';
import type { Appointment, AppointmentStatus } from '@/types/appointment';
import { executeRequest } from '@/utils/request';

interface CreateAppointmentPayload {
  examId: string;
  scheduledAt: string;
  notes?: string;
}

interface ListAppointmentsParams extends PaginationQueryParams {
  scheduledDate?: string;
}

interface UpdateAppointmentPayload {
  examId?: string;
  scheduledAt?: string;
  notes?: string | null;
  status?: AppointmentStatus;
}

export const listAppointments = async (
  params: ListAppointmentsParams = {},
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

export const updateAppointmentById = async (
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> => {
  return executeRequest(() => api.patch<Appointment>(`/appointments/${id}`, payload));
};

export const cancelAppointmentById = async (id: string): Promise<Appointment> => {
  return executeRequest(() => api.patch<Appointment>(`/appointments/${id}/cancel`));
};

export const deleteAppointmentById = async (id: string): Promise<void> => {
  await executeRequest(() => api.delete<void>(`/appointments/${id}`));
};
