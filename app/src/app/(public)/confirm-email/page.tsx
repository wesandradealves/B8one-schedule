import { Suspense } from 'react';
import { EmailConfirmationCard } from '@/components/organisms/auth/email-confirmation-card';
import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';

export const metadata = buildSeoMetadata({
  title: 'Confirmar e-mail',
  description: 'Confirmação de e-mail para ativação da conta.',
  path: APP_ROUTES.confirmEmail,
  indexable: false,
});

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Validando confirmação...</div>}>
      <EmailConfirmationCard />
    </Suspense>
  );
}
