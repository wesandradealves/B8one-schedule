import { buildSeoMetadata } from '@/utils/seo';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Login',
  description: 'Acesse o portal de agendamento',
  path: APP_ROUTES.login,
});

export default function LoginPage() {
  return (
    <PageContainer>
      <PageTitle>Login</PageTitle>
      <PageDescription>
        Base de autenticação pronta para integração com o fluxo de login + 2FA.
      </PageDescription>
    </PageContainer>
  );
}
