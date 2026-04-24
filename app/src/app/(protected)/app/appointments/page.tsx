import { buildSeoMetadata } from '@/utils/seo';
import { APP_ROUTES } from '@/utils/route';
import { AppointmentsListSection } from '@/components/organisms/protected/appointments-list-section';

export const metadata = buildSeoMetadata({
  title: 'Agendamentos',
  description: 'Acompanhe os agendamentos do usuário autenticado',
  path: APP_ROUTES.appointments,
});

export default function AppointmentsPage() {
  return <AppointmentsListSection />;
}
