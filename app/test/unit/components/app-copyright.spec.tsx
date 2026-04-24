import { render, screen } from '@testing-library/react';
import { AppCopyright } from '@/components/atoms/app-copyright';

describe('AppCopyright', () => {
  it('should render footer copyright text with author link', () => {
    render(<AppCopyright />);

    expect(screen.getByText('Feito com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wesley Alves' })).toHaveAttribute(
      'href',
      'https://github.com/wesandradealves',
    );
  });
});
