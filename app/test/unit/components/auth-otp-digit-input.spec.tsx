import { render, screen } from '@testing-library/react';
import { AuthOtpDigitInput } from '@/components/atoms/auth-otp-digit-input';

describe('AuthOtpDigitInput', () => {
  it('should render non-error style by default', () => {
    render(<AuthOtpDigitInput aria-label="otp-default" />);

    const input = screen.getByLabelText('otp-default');
    expect(input).toHaveClass('border-slate-300');
  });

  it('should render error style when hasError is true', () => {
    render(<AuthOtpDigitInput aria-label="otp-error" hasError />);

    const input = screen.getByLabelText('otp-error');
    expect(input).toHaveClass('border-red-400');
  });
});
