import { render, screen } from '@testing-library/react';
import { ProtectedNavItem } from '@/components/molecules/protected-nav-item';

describe('ProtectedNavItem', () => {
  it('should render navigation link with icon and active state marker', () => {
    render(
      <ProtectedNavItem href="/app/exams" label="Exames" icon="exams" isActive />,
    );

    const link = screen.getByRole('link', { name: 'Exames' });
    expect(link).toHaveAttribute('href', '/app/exams');
    expect(link).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('protected-nav-icon-exams')).toBeInTheDocument();
  });
});
