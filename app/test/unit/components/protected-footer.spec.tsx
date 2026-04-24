import { render, screen } from '@testing-library/react';
import { ProtectedFooter } from '@/components/organisms/protected/protected-footer';

describe('ProtectedFooter', () => {
  it('should render app icon and copyright text', () => {
    const { container } = render(<ProtectedFooter />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Feito com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wesley Alves' })).toHaveAttribute(
      'href',
      'https://github.com/wesandradealves',
    );
  });
});
