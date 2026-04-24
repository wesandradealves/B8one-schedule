import { fireEvent, render, screen } from '@testing-library/react';
import { ProtectedUserMenu } from '@/components/molecules/protected-user-menu';

const logoutMock = jest.fn();

jest.mock('@/hooks/useLogout', () => ({
  useLogout: () => logoutMock,
}));

describe('ProtectedUserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open dropdown with account link and trigger centralized logout', () => {
    render(
      <ProtectedUserMenu
        displayName="Wesley Alves"
        initials="WA"
        accountHref="/app/my-account"
      />,
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Wesley Alves/i,
      }),
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveAttribute(
      'href',
      '/app/my-account',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('should close dropdown when clicking outside the menu', () => {
    render(
      <div>
        <button type="button">outside</button>
        <ProtectedUserMenu
          displayName="Wesley Alves"
          initials="WA"
          accountHref="/app/my-account"
        />
      </div>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Wesley Alves/i,
      }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should keep dropdown open when clicking inside and close on escape key', () => {
    render(
      <ProtectedUserMenu
        displayName="Wesley Alves"
        initials="WA"
        accountHref="/app/my-account"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Wesley Alves/i,
      }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('menuitem', { name: 'Minha conta' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
