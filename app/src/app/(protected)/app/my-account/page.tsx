import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Minha conta',
  description: 'Dados da conta do usuário autenticado',
  path: APP_ROUTES.myAccount,
});

export default function MyAccountPage() {
  return (
    <PageContainer>
      <PageTitle>Minha conta</PageTitle>
      <PageDescription>Conteúdo em construção.</PageDescription>
    </PageContainer>
  );
}
