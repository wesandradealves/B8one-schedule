import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';
import { ClientHomeExamsSection } from '@/components/organisms/protected/client-home-exams-section';

export const metadata = buildSeoMetadata({
  title: 'Aplicação',
  description: 'Área autenticada da aplicação',
  path: APP_ROUTES.app,
});

export default function AppHomePage() {
  return <ClientHomeExamsSection />;
}
