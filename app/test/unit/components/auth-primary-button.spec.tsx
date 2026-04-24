import { render, screen } from '@testing-library/react';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';

describe('AuthPrimaryButton', () => {
  it('should keep button enabled when not loading and not disabled', () => {
    render(<AuthPrimaryButton>Enviar</AuthPrimaryButton>);

    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('should disable button and render spinner while loading', () => {
    const { container } = render(
      <AuthPrimaryButton loading>
        Enviar
      </AuthPrimaryButton>,
    );

    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });
});
