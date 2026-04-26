import { ExamCreateForm } from '@/components/organisms/protected/exam-create-form';
import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Novo exame',
  description: 'Cadastro de exame (admin)',
  path: APP_ROUTES.examsCreate,
});

export default function CreateExamPage() {
  return <ExamCreateForm />;
}
