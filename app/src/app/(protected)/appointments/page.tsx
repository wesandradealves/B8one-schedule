import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';

export const metadata = buildSeoMetadata({
  title: 'Agendamentos',
  description: 'Acompanhe os agendamentos do usuário autenticado',
  path: '/appointments',
});

export default function AppointmentsPage() {
  return (
    <PageContainer>
      <PageTitle>Agendamentos</PageTitle>
      <PageDescription>
        Estrutura base pronta para listagem e gerenciamento de agendamentos.
      </PageDescription>
    </PageContainer>
  );
}
