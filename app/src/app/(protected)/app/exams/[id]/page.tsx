import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/seo';
import { ExamSchedulingCalendarSection } from '@/components/organisms/protected/exam-scheduling-calendar-section';
import { APP_ROUTES } from '@/utils/route';

interface ExamDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExamDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  return buildSeoMetadata({
    title: `Exame ${id}`,
    description: 'Detalhes do exame para agendamento',
    path: APP_ROUTES.examDetails(id),
  });
}

export default async function ExamDetailsPage({ params }: ExamDetailsPageProps) {
  const { id } = await params;

  return <ExamSchedulingCalendarSection examId={id} />;
}
