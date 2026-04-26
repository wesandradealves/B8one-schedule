import { UserCreateForm } from '@/components/organisms/protected/user-create-form';
import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Novo usuário',
  description: 'Cadastro de usuário (admin)',
  path: APP_ROUTES.usersCreate,
});

export default function CreateUserPage() {
  return <UserCreateForm />;
}
