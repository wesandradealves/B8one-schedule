import { render, screen } from '@testing-library/react';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';

describe('AuthInlineMessage', () => {
  it('should expose assertive alert for error messages', () => {
    render(<AuthInlineMessage message={{ level: 'error', text: 'Erro de autenticação' }} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Erro de autenticação');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('should expose polite status for success/info messages', () => {
    render(<AuthInlineMessage message={{ level: 'success', text: 'Operação concluída' }} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Operação concluída');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
