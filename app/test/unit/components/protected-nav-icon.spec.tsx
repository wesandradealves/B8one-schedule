import { render, screen } from '@testing-library/react';
import { ProtectedNavIcon } from '@/components/atoms/protected-nav-icon';

describe('ProtectedNavIcon', () => {
  it('should render icon variations by name', () => {
    render(
      <>
        <ProtectedNavIcon name="home" />
        <ProtectedNavIcon name="exams" />
        <ProtectedNavIcon name="appointments" />
        <ProtectedNavIcon name="users" />
      </>,
    );

    expect(screen.getByTestId('protected-nav-icon-home')).toBeInTheDocument();
    expect(screen.getByTestId('protected-nav-icon-exams')).toBeInTheDocument();
    expect(screen.getByTestId('protected-nav-icon-appointments')).toBeInTheDocument();
    expect(screen.getByTestId('protected-nav-icon-users')).toBeInTheDocument();
  });
});
