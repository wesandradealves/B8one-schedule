import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
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

  return (
    <PageContainer>
      <PageTitle>Detalhes do exame</PageTitle>
      <PageDescription>ID do exame: {id}</PageDescription>
    </PageContainer>
  );
}
