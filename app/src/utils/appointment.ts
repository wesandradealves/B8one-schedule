import type { AppointmentStatus } from '@/types/appointment';

const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Pendente',
  SCHEDULED: 'Agendado',
  CANCELLED: 'Cancelado',
};

export const toAppointmentStatusLabel = (status: AppointmentStatus): string => {
  return APPOINTMENT_STATUS_LABEL[status];
};
