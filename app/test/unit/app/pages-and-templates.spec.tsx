import { render, screen } from '@testing-library/react';
import LoginPage, { metadata as loginMetadata } from '@/app/(public)/login/page';
import AppPage, { metadata as appMetadata } from '@/app/(protected)/app/page';
import ExamsPage, { metadata as examsMetadata } from '@/app/(protected)/app/exams/page';
import AppointmentsPage, {
  metadata as appointmentsMetadata,
} from '@/app/(protected)/app/appointments/page';
import ExamDetailsPage, { generateMetadata } from '@/app/(protected)/app/exams/[id]/page';
import PublicTemplate from '@/app/(public)/template';
import ProtectedTemplate from '@/app/(protected)/template';

describe('app pages and route-group templates', () => {
  it('should expose metadata for static pages with app route paths', () => {
    expect(loginMetadata.alternates?.canonical).toBe('/login');
    expect(appMetadata.alternates?.canonical).toBe('/app');
    expect(examsMetadata.alternates?.canonical).toBe('/app/exams');
    expect(appointmentsMetadata.alternates?.canonical).toBe('/app/appointments');
  });

  it('should render static pages', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();

    render(<AppPage />);
    expect(screen.getByText('Área autenticada')).toBeInTheDocument();

    render(<ExamsPage />);
    expect(screen.getByText('Exames')).toBeInTheDocument();

    render(<AppointmentsPage />);
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
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
