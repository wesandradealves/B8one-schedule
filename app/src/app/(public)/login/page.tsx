import { Suspense } from 'react';
import { AuthFlowCard } from '@/components/organisms/auth/auth-flow-card';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Carregando autenticacao...</div>}>
      <AuthFlowCard />
    </Suspense>
  );
}
