import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';
import { MyAccountForm } from '@/components/organisms/protected/my-account-form';

export const metadata = buildSeoMetadata({
  title: 'Minha conta',
  description: 'Dados da conta do usuário autenticado',
  path: APP_ROUTES.myAccount,
});

export default function MyAccountPage() {
  return <MyAccountForm />;
}
