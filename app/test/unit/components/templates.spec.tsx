import { render, screen } from '@testing-library/react';
import { PublicRoutesTemplate } from '@/components/templates/public-routes-template';
import { ProtectedRoutesTemplate } from '@/components/templates/protected-routes-template';

const useAuthMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('@/hooks/useLogout', () => ({
  useLogout: () => jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/app/users',
}));

describe('route templates', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });
  });

  it('should render public template content', () => {
    render(
      <PublicRoutesTemplate>
        <div>public-content</div>
      </PublicRoutesTemplate>,
    );

    expect(screen.getByText('public-content')).toBeInTheDocument();
    expect(screen.getByText('Feito com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wesley Alves' })).toHaveAttribute(
      'href',
      'https://github.com/wesandradealves',
    );
  });

  it('should render protected template content', () => {
    render(
      <ProtectedRoutesTemplate>
        <div>protected-content</div>
      </ProtectedRoutesTemplate>,
    );

    expect(screen.getByText('protected-content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iniciais do usuário Admin/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Início' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getByText('Feito com')).toBeInTheDocument();
  });
});
