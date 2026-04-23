import api from '@/services/api';
import type { PaginatedResult } from '@/types/api';
import type { Appointment } from '@/types/appointment';

interface CreateAppointmentPayload {
  examId: string;
  scheduledAt: string;
  notes?: string;
}

export const listAppointments = async (
  page = 1,
  limit = 10,
): Promise<PaginatedResult<Appointment>> => {
  const response = await api.get<PaginatedResult<Appointment>>('/appointments/all', {
    params: { page, limit },
  });

  return response.data;
};

export const createAppointment = async (
  payload: CreateAppointmentPayload,
): Promise<Appointment> => {
  const response = await api.post<Appointment>('/appointments', payload);
  return response.data;
};
