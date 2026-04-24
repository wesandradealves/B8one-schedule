import { render, screen } from '@testing-library/react';
import { PublicRoutesTemplate } from '@/components/templates/public-routes-template';
import { ProtectedRoutesTemplate } from '@/components/templates/protected-routes-template';

describe('route templates', () => {
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
  });
});
