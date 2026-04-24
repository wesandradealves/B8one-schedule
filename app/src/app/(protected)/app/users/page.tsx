import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';
import { UsersListSection } from '@/components/organisms/protected/users-list-section';

export const metadata = buildSeoMetadata({
  title: 'Usuários',
  description: 'Gerenciamento de usuários (admin)',
  path: APP_ROUTES.users,
});

export default function UsersPage() {
  return <UsersListSection />;
}
