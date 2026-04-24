export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED';
export type AppointmentListSortBy = 'scheduledAt' | 'status';

export type AppointmentChangeStatus = 'NONE' | 'PENDING';

export interface Appointment {
  id: string;
  userId: string;
  examId: string;
  examName: string;
  scheduledAt: string;
  notes: string | null;
  status: AppointmentStatus;
  changeStatus: AppointmentChangeStatus;
  requestedExamId?: string | null;
  requestedExamName?: string | null;
  requestedScheduledAt?: string | null;
  requestedNotes?: string | null;
  userFullName?: string;
  userEmail?: string;
}
