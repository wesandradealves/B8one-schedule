import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(public)/login/page';
import ConfirmEmailPage, {
  metadata as confirmEmailMetadata,
} from '@/app/(public)/confirm-email/page';
import AppPage, { metadata as appMetadata } from '@/app/(protected)/app/page';
import ExamsPage, { metadata as examsMetadata } from '@/app/(protected)/app/exams/page';
import CreateExamPage, {
  metadata as createExamMetadata,
} from '@/app/(protected)/app/exams/new/page';
import AppointmentsPage, {
  metadata as appointmentsMetadata,
} from '@/app/(protected)/app/appointments/page';
import UsersPage, { metadata as usersMetadata } from '@/app/(protected)/app/users/page';
import CreateUserPage, {
  metadata as createUserMetadata,
} from '@/app/(protected)/app/users/new/page';
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

jest.mock('@/components/organisms/auth/email-confirmation-card', () => ({
  __esModule: true,
  EmailConfirmationCard: () => <div>email-confirmation-card</div>,
}));

jest.mock('@/components/organisms/protected/my-account-form', () => ({
  __esModule: true,
  MyAccountForm: () => <div>my-account-form</div>,
}));

jest.mock('@/components/organisms/protected/exams-list-section', () => ({
  __esModule: true,
  ExamsListSection: () => <div>exams-list-section</div>,
}));

jest.mock('@/components/organisms/protected/exam-create-form', () => ({
  __esModule: true,
  ExamCreateForm: () => <div>exam-create-form</div>,
}));

jest.mock('@/components/organisms/protected/appointments-list-section', () => ({
  __esModule: true,
  AppointmentsListSection: () => <div>appointments-list-section</div>,
}));

jest.mock('@/components/organisms/protected/users-list-section', () => ({
  __esModule: true,
  UsersListSection: () => <div>users-list-section</div>,
}));

jest.mock('@/components/organisms/protected/user-create-form', () => ({
  __esModule: true,
  UserCreateForm: () => <div>user-create-form</div>,
}));

jest.mock('@/components/organisms/protected/exam-scheduling-calendar-section', () => ({
  __esModule: true,
  ExamSchedulingCalendarSection: () => <div>exam-scheduling-calendar-section</div>,
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

jest.mock('@/hooks/useClientHomeExams', () => ({
  __esModule: true,
  useClientHomeExams: () => ({
    exams: [],
    isLoading: false,
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
    expect(confirmEmailMetadata.alternates?.canonical).toBe('/confirm-email');
    expect(appMetadata.alternates?.canonical).toBe('/app');
    expect(examsMetadata.alternates?.canonical).toBe('/app/exams');
    expect(createExamMetadata.alternates?.canonical).toBe('/app/exams/new');
    expect(appointmentsMetadata.alternates?.canonical).toBe('/app/appointments');
    expect(usersMetadata.alternates?.canonical).toBe('/app/users');
    expect(createUserMetadata.alternates?.canonical).toBe('/app/users/new');
    expect(myAccountMetadata.alternates?.canonical).toBe('/app/my-account');
  });

  it('should render static pages', () => {
    render(<LoginPage />);
    expect(screen.getByText('auth-flow-card')).toBeInTheDocument();

    render(<ConfirmEmailPage />);
    expect(screen.getByText('email-confirmation-card')).toBeInTheDocument();

    render(<AppPage />);
    expect(screen.getByText('Área autenticada')).toBeInTheDocument();

    render(<ExamsPage />);
    expect(screen.getByText('exams-list-section')).toBeInTheDocument();

    render(<CreateExamPage />);
    expect(screen.getByText('exam-create-form')).toBeInTheDocument();

    render(<AppointmentsPage />);
    expect(screen.getByText('appointments-list-section')).toBeInTheDocument();

    render(<UsersPage />);
    expect(screen.getByText('users-list-section')).toBeInTheDocument();

    render(<CreateUserPage />);
    expect(screen.getByText('user-create-form')).toBeInTheDocument();

    render(<MyAccountPage />);
    expect(screen.getByText('my-account-form')).toBeInTheDocument();
  });

  it('should render dynamic exam page and metadata', async () => {
    const page = await ExamDetailsPage({
      params: Promise.resolve({ id: 'exam-1' }),
    });
    render(page);
    expect(screen.getByText('exam-scheduling-calendar-section')).toBeInTheDocument();

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
