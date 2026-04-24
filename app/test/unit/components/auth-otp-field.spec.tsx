import { fireEvent, render, screen } from '@testing-library/react';
import { AuthOtpField } from '@/components/molecules/auth-otp-field';

describe('AuthOtpField', () => {
  it('should render segmented inputs and countdown label', () => {
    render(
      <AuthOtpField
        label="Codigo 2FA"
        value=""
        countdownLabel="Codigo expira em"
        countdownValue="03:00"
        onChange={jest.fn()}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);
    expect(screen.getByRole('group', { name: 'Codigo 2FA' })).toBeInTheDocument();
    expect(screen.getByText('Codigo expira em: 03:00')).toBeInTheDocument();
    otpInputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  it('should emit updated code when typing and pasting values', () => {
    const onChangeMock = jest.fn();

    render(
      <AuthOtpField
        label="Codigo 2FA"
        value=""
        countdownLabel="Codigo expira em"
        countdownValue="03:00"
        onChange={onChangeMock}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');

    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    expect(onChangeMock).toHaveBeenCalledWith('1');

    fireEvent.paste(otpInputs[0], {
      clipboardData: {
        getData: () => '123456',
      },
    });
    expect(onChangeMock).toHaveBeenCalledWith('123456');
  });

  it('should expose error semantics for assistive technologies', () => {
    render(
      <AuthOtpField
        label="Codigo 2FA"
        value="123"
        error="Código inválido"
        countdownLabel="Codigo expira em"
        countdownValue="02:59"
        onChange={jest.fn()}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');
    otpInputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input.getAttribute('aria-describedby')).toContain('countdown');
      expect(input.getAttribute('aria-describedby')).toContain('error');
    });
  });

  it('should handle empty and multi-digit typing branches', () => {
    const onChangeMock = jest.fn();

    render(
      <AuthOtpField
        label="Codigo 2FA"
        value=""
        countdownLabel="Codigo expira em"
        countdownValue="02:59"
        onChange={onChangeMock}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');

    fireEvent.change(otpInputs[0], { target: { value: 'a' } });
    expect(onChangeMock).toHaveBeenLastCalledWith('');

    fireEvent.change(otpInputs[0], { target: { value: '123' } });
    expect(onChangeMock).toHaveBeenLastCalledWith('123');
  });

  it('should support keyboard navigation and backspace branch', () => {
    const onChangeMock = jest.fn();

    render(
      <AuthOtpField
        label="Codigo 2FA"
        value=""
        countdownLabel="Codigo expira em"
        countdownValue="02:59"
        onChange={onChangeMock}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');

    otpInputs[1].focus();
    fireEvent.keyDown(otpInputs[1], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(otpInputs[0]);

    fireEvent.keyDown(otpInputs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(otpInputs[1]);

    fireEvent.keyDown(otpInputs[1], { key: 'Backspace' });
    expect(onChangeMock).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(otpInputs[0]);
  });

  it('should ignore paste when clipboard does not contain digits', () => {
    const onChangeMock = jest.fn();

    render(
      <AuthOtpField
        label="Codigo 2FA"
        value=""
        countdownLabel="Codigo expira em"
        countdownValue="02:59"
        onChange={onChangeMock}
      />,
    );

    const otpInputs = screen.getAllByRole('textbox');

    fireEvent.paste(otpInputs[0], {
      clipboardData: {
        getData: () => 'abc',
      },
    });

    expect(onChangeMock).not.toHaveBeenCalled();
  });
});
