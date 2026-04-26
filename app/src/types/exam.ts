export type ExamListSortBy = 'createdAt' | 'priceCents';

export interface Exam {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

export interface CreateExamPayload {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceCents: number;
  availableWeekdays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}
