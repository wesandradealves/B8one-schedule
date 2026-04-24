import { fireEvent, render, screen } from '@testing-library/react';
import { AuthCheckbox } from '@/components/atoms/auth-checkbox';

describe('AuthCheckbox', () => {
  it('should render label and call onChange when toggled', () => {
    const handleChange = jest.fn();

    render(
      <AuthCheckbox
        name="remember"
        label="Lembrar sessão"
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'Lembrar sessão',
    });

    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
