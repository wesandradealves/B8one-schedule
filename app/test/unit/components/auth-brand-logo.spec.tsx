import { render, screen } from '@testing-library/react';
import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';

describe('AuthBrandLogo', () => {
  it('should render defaults with brand text', () => {
    render(<AuthBrandLogo />);

    expect(screen.getByText('ExamPoint')).toBeInTheDocument();
  });

  it('should render icon-only variant without text', () => {
    const { container } = render(<AuthBrandLogo tone="white" size="sm" iconOnly />);

    expect(screen.queryByText('ExamPoint')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
