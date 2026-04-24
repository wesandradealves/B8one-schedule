import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Agendamentos',
  description: 'Acompanhe os agendamentos do usuário autenticado',
  path: APP_ROUTES.appointments,
});

export default function AppointmentsPage() {
  return (
    <PageContainer>
      <PageTitle>Agendamentos</PageTitle>
      <PageDescription>Conteúdo em construção.</PageDescription>
    </PageContainer>
  );
}
