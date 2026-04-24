import { fireEvent, render, screen } from '@testing-library/react';
import { ProtectedTopbar } from '@/components/organisms/protected/protected-topbar';

const useUserDisplayMock = jest.fn();
const logoutMock = jest.fn();

jest.mock('@/hooks/useUserDisplay', () => ({
  useUserDisplay: () => useUserDisplayMock(),
}));

jest.mock('@/hooks/useLogout', () => ({
  useLogout: () => logoutMock,
}));

describe('ProtectedTopbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserDisplayMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'cortney.reichel43@ethereal.email',
        profile: 'CLIENT',
      },
      displayName: 'Cortney Reichel43',
      initials: 'CR',
    });
  });

  it('should render app title and user pill with derived initials', () => {
    render(<ProtectedTopbar />);

    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('CR')).toBeInTheDocument();
    expect(screen.getByText('Cortney Reichel43')).toBeInTheDocument();
  });

  it('should keep account and logout actions inside dropdown menu', () => {
    render(<ProtectedTopbar />);

    fireEvent.click(screen.getByRole('button', { name: /Cortney Reichel43/i }));

    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveAttribute(
      'href',
      '/app/my-account',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
