import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { LogoutLink } from '@/components/shared/logout-link';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Exames',
  description: 'Listagem de exames disponíveis',
  path: APP_ROUTES.exams,
});

export default function ExamsPage() {
  return (
    <PageContainer>
      <PageTitle>Exames</PageTitle>
      <PageDescription>
        Estrutura base pronta para busca, paginação e integração com React Query.
      </PageDescription>
      <LogoutLink />
    </PageContainer>
  );
}
