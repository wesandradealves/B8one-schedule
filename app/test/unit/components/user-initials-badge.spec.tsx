import { render, screen } from '@testing-library/react';
import { UserInitialsBadge } from '@/components/atoms/user-initials-badge';

describe('UserInitialsBadge', () => {
  it('should render provided initials', () => {
    render(<UserInitialsBadge initials="WA" />);
    expect(screen.getByText('WA')).toBeInTheDocument();
    expect(screen.getByLabelText('Iniciais do usuário')).toBeInTheDocument();
  });

  it('should render skeleton when initials are not available', () => {
    render(<UserInitialsBadge initials="" />);
    expect(screen.getByLabelText('Carregando usuário')).toBeInTheDocument();
  });
});
