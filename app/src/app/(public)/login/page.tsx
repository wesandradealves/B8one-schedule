import { buildSeoMetadata } from '@/hooks/useSeoMetadata';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';

export const metadata = buildSeoMetadata({
  title: 'Login',
  description: 'Acesse o portal de agendamento',
  path: '/login',
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
