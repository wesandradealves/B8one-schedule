import { render, screen } from '@testing-library/react';
import { ListCreateLink } from '@/components/atoms/list-create-link';

describe('ListCreateLink', () => {
  it('renders link with href and label', () => {
    render(<ListCreateLink href="/app/users/new">Adicionar usuário</ListCreateLink>);

    const link = screen.getByRole('link', { name: 'Adicionar usuário' });
    expect(link).toHaveAttribute('href', '/app/users/new');
  });
});
