import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Usuários',
  description: 'Gerenciamento de usuários (admin)',
  path: APP_ROUTES.users,
});

export default function UsersPage() {
  return (
    <PageContainer>
      <PageTitle>Usuários</PageTitle>
      <PageDescription>Conteúdo em construção.</PageDescription>
    </PageContainer>
  );
}
