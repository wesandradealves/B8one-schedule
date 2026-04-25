import api from '@/services/api';
import type {
  CsvExportResult,
  CsvImportResult,
  PaginatedResult,
  PaginationQueryParams,
} from '@/types/api';
import type {
  Appointment,
  AppointmentAvailabilitySlot,
  AppointmentListSortBy,
  AppointmentStatus,
} from '@/types/appointment';
import { executeRequest } from '@/utils/request';

interface CreateAppointmentPayload {
  examId: string;
  scheduledAt: string;
  notes?: string;
}

interface ListAppointmentsParams extends PaginationQueryParams {
  scheduledDate?: string;
  sortBy?: AppointmentListSortBy;
}

interface ListAppointmentAvailabilityParams {
  examId: string;
  startsAt: string;
  endsAt: string;
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

export const listAppointmentAvailability = async (
  params: ListAppointmentAvailabilityParams,
): Promise<AppointmentAvailabilitySlot[]> => {
  return executeRequest(() =>
    api.get<AppointmentAvailabilitySlot[]>('/appointments/availability', {
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

export const importAppointmentsCsv = async (
  csvContent: string,
): Promise<CsvImportResult> => {
  return executeRequest(() =>
    api.post<CsvImportResult>('/appointments/import/csv', {
      csvContent,
    }),
  );
};

export const exportAppointmentsCsv = async (): Promise<CsvExportResult> => {
  return executeRequest(() => api.get<CsvExportResult>('/appointments/export/csv'));
};
