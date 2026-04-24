import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Aplicação',
  description: 'Área autenticada da aplicação',
  path: APP_ROUTES.app,
});

export default function AppHomePage() {
  return (
    <PageContainer>
      <PageTitle>Área autenticada</PageTitle>
      <PageDescription>
        Espaço reservado para o conteúdo principal da dashboard.
      </PageDescription>
    </PageContainer>
  );
}
