import { render, screen } from '@testing-library/react';
import { AuthFormField } from '@/components/molecules/auth-form-field';

describe('AuthFormField', () => {
  it('should render field with left icon', () => {
    const { container } = render(
      <AuthFormField
        label="Email"
        name="email"
        leftIcon="email"
        defaultValue=""
      />,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('pl-10');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should render field error text when provided with proper aria description', () => {
    render(
      <AuthFormField
        label="Senha"
        name="password"
        type="password"
        defaultValue=""
        error="Senha obrigatória"
      />,
    );

    const input = screen.getByLabelText('Senha');
    const errorText = screen.getByText('Senha obrigatória');
    const errorId = errorText.getAttribute('id');

    expect(errorText).toBeInTheDocument();
    expect(errorId).not.toBeNull();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorId as string);
  });
});
