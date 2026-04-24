import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(public)/login/page';
import AppPage, { metadata as appMetadata } from '@/app/(protected)/app/page';
import ExamsPage, { metadata as examsMetadata } from '@/app/(protected)/app/exams/page';
import AppointmentsPage, {
  metadata as appointmentsMetadata,
} from '@/app/(protected)/app/appointments/page';
import UsersPage, { metadata as usersMetadata } from '@/app/(protected)/app/users/page';
import MyAccountPage, {
  metadata as myAccountMetadata,
} from '@/app/(protected)/app/my-account/page';
import ExamDetailsPage, { generateMetadata } from '@/app/(protected)/app/exams/[id]/page';
import PublicTemplate from '@/app/(public)/template';
import ProtectedTemplate from '@/app/(protected)/template';

jest.mock('@/components/organisms/auth/auth-flow-card', () => ({
  __esModule: true,
  AuthFlowCard: () => <div>auth-flow-card</div>,
}));

jest.mock('@/components/organisms/protected/my-account-form', () => ({
  __esModule: true,
  MyAccountForm: () => <div>my-account-form</div>,
}));

jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({
    user: {
      id: 'admin-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
    },
  }),
}));

jest.mock('@/hooks/useLogout', () => ({
  __esModule: true,
  useLogout: () => jest.fn(),
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => '/app',
}));

describe('app pages and route-group templates', () => {
  it('should expose metadata for protected static pages with app route paths', () => {
    expect(appMetadata.alternates?.canonical).toBe('/app');
    expect(examsMetadata.alternates?.canonical).toBe('/app/exams');
    expect(appointmentsMetadata.alternates?.canonical).toBe('/app/appointments');
    expect(usersMetadata.alternates?.canonical).toBe('/app/users');
    expect(myAccountMetadata.alternates?.canonical).toBe('/app/my-account');
  });

  it('should render static pages', () => {
    render(<LoginPage />);
    expect(screen.getByText('auth-flow-card')).toBeInTheDocument();

    render(<AppPage />);
    expect(screen.getByText('Área autenticada')).toBeInTheDocument();

    render(<ExamsPage />);
    expect(screen.getByText('Exames')).toBeInTheDocument();

    render(<AppointmentsPage />);
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();

    render(<UsersPage />);
    expect(screen.getByText('Usuários')).toBeInTheDocument();

    render(<MyAccountPage />);
    expect(screen.getByText('my-account-form')).toBeInTheDocument();
  });

  it('should render dynamic exam page and metadata', async () => {
    const page = await ExamDetailsPage({
      params: Promise.resolve({ id: 'exam-1' }),
    });
    render(page);
    expect(screen.getByText('Detalhes do exame')).toBeInTheDocument();
    expect(screen.getByText('ID do exame: exam-1')).toBeInTheDocument();

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'exam-1' }),
    });
    expect(metadata.alternates?.canonical).toBe('/app/exams/exam-1');
  });

  it('should render group templates around children', () => {
    render(
      <PublicTemplate>
        <div>public-child</div>
      </PublicTemplate>,
    );
    expect(screen.getByText('public-child')).toBeInTheDocument();

    render(
      <ProtectedTemplate>
        <div>protected-child</div>
      </ProtectedTemplate>,
    );
    expect(screen.getByText('protected-child')).toBeInTheDocument();
  });
});
