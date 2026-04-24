import { render, screen } from '@testing-library/react';
import { ProtectedSidebar } from '@/components/organisms/protected/protected-sidebar';

const pathnameMock = jest.fn();
const useProtectedNavigationMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

jest.mock('@/hooks/useProtectedNavigation', () => ({
  useProtectedNavigation: () => useProtectedNavigationMock(),
}));

describe('ProtectedSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pathnameMock.mockReturnValue('/app/exams');
  });

  it('should show users navigation item only for admin profile', () => {
    useProtectedNavigationMock.mockReturnValue([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
      { label: 'Agendamentos', href: '/app/appointments', icon: 'appointments' },
      { label: 'Usuários', href: '/app/users', icon: 'users' },
    ]);

    const { rerender } = render(<ProtectedSidebar />);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Exames' })).toHaveAttribute('href', '/app/exams');
    expect(screen.getByRole('link', { name: 'Agendamentos' })).toHaveAttribute(
      'href',
      '/app/appointments',
    );
    expect(screen.getByRole('link', { name: 'Usuários' })).toHaveAttribute('href', '/app/users');

    useProtectedNavigationMock.mockReturnValue([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
      { label: 'Agendamentos', href: '/app/appointments', icon: 'appointments' },
    ]);

    rerender(<ProtectedSidebar />);
    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument();
  });

  it('should activate only the matching route item for nested paths', () => {
    pathnameMock.mockReturnValue('/app/exams');
    useProtectedNavigationMock.mockReturnValue([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
      { label: 'Agendamentos', href: '/app/appointments', icon: 'appointments' },
    ]);

    render(<ProtectedSidebar />);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('link', { name: 'Exames' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Agendamentos' })).toHaveAttribute(
      'data-active',
      'false',
    );
  });

  it('should activate home only on exact /app path', () => {
    pathnameMock.mockReturnValue('/app');
    useProtectedNavigationMock.mockReturnValue([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
    ]);

    render(<ProtectedSidebar />);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Exames' })).toHaveAttribute('data-active', 'false');
  });

  it('should keep navigation links inactive when pathname is unavailable', () => {
    pathnameMock.mockReturnValue(null);
    useProtectedNavigationMock.mockReturnValue([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
    ]);

    render(<ProtectedSidebar />);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('link', { name: 'Exames' })).toHaveAttribute('data-active', 'false');
  });
});
