import { fireEvent, render, screen } from '@testing-library/react';
import { LogoutLink } from '@/components/shared/logout-link';

const logoutMock = jest.fn();

jest.mock('@/hooks/useLogout', () => ({
  useLogout: () => logoutMock,
}));

describe('LogoutLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render logout action and trigger centralized logout hook', () => {
    render(<LogoutLink />);

    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('should support menu variant and execute post-logout callback', () => {
    const onAfterLogout = jest.fn();
    render(<LogoutLink variant="menu" onAfterLogout={onAfterLogout} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(onAfterLogout).toHaveBeenCalledTimes(1);
  });
});
