export type ExamListSortBy = 'createdAt' | 'priceCents';

export interface Exam {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
}
