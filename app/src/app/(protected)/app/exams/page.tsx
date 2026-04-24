import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';
import { ExamsListSection } from '@/components/organisms/protected/exams-list-section';

export const metadata = buildSeoMetadata({
  title: 'Exames',
  description: 'Listagem de exames disponíveis',
  path: APP_ROUTES.exams,
});

export default function ExamsPage() {
  return <ExamsListSection />;
}
