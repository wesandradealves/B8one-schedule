import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';

export const metadata = buildSeoMetadata({
  title: 'Exames',
  description: 'Listagem de exames disponíveis',
  path: '/exams',
});

export default function ExamsPage() {
  return (
    <PageContainer>
      <PageTitle>Exames</PageTitle>
      <PageDescription>
        Estrutura base pronta para busca, paginação e integração com React Query.
      </PageDescription>
    </PageContainer>
  );
}
