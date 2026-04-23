import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';

export const metadata = buildSeoMetadata({
  title: 'Aplicação',
  description: 'Área autenticada da aplicação',
  path: '/app',
});

export default function AppHomePage() {
  return (
    <PageContainer>
      <PageTitle>Área autenticada</PageTitle>
      <PageDescription>
        Use /app/exams e /app/appointments para navegar pelos módulos protegidos.
      </PageDescription>
    </PageContainer>
  );
}
