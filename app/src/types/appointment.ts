export interface Appointment {
  id: string;
  userId: string;
  examId: string;
  scheduledAt: string;
  notes: string | null;
  status: string;
}
