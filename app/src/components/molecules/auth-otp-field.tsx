'use client';

import {
  useId,
  useRef,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import styled from 'styled-components';
import { AuthOtpDigitInput } from '@/components/atoms/auth-otp-digit-input';

const OTP_LENGTH = 6;

interface AuthOtpFieldProps {
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  countdownLabel: string;
  countdownValue: string;
  onChange: (value: string) => void;
}

const FieldRoot = styled.div.attrs({
  className: 'flex w-full flex-col gap-2',
})``;

const FieldLabel = styled.p.attrs({
  className: 'sr-only',
})``;

const DigitsRow = styled.div.attrs({
  className: 'flex items-center justify-center gap-2',
})``;

const CountdownText = styled.p.attrs({
  className: 'text-center text-xs text-slate-500',
})``;

const FieldError = styled.span.attrs({
  className: 'text-center text-xs text-red-600',
})``;

const sanitizeDigits = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
};

export function AuthOtpField({
  label,
  value,
  error,
  disabled = false,
  countdownLabel,
  countdownValue,
  onChange,
}: AuthOtpFieldProps) {
  const fieldId = useId();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');
  const labelId = `${fieldId}-label`;
  const countdownId = `${fieldId}-countdown`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [countdownId, errorId].filter(Boolean).join(' ');

  const updateAtIndex = (index: number, digit: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(sanitizeDigits(nextDigits.join('')));
  };

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (index: number, nextRawValue: string) => {
    const nextDigitsRaw = sanitizeDigits(nextRawValue);

    if (nextDigitsRaw.length === 0) {
      updateAtIndex(index, '');
      return;
    }

    if (nextDigitsRaw.length === 1) {
      updateAtIndex(index, nextDigitsRaw);

      if (index < OTP_LENGTH - 1) {
        focusIndex(index + 1);
      }
      return;
    }

    const nextDigits = [...digits];
    nextDigitsRaw.split('').forEach((digit, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < OTP_LENGTH) {
        nextDigits[targetIndex] = digit;
      }
    });
    onChange(sanitizeDigits(nextDigits.join('')));

    const lastFilledIndex = Math.min(index + nextDigitsRaw.length - 1, OTP_LENGTH - 1);
    focusIndex(lastFilledIndex);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
      return;
    }

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      updateAtIndex(index - 1, '');
      focusIndex(index - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = sanitizeDigits(event.clipboardData.getData('text'));

    if (pastedDigits.length === 0) {
      return;
    }

    onChange(pastedDigits);
    focusIndex(Math.min(pastedDigits.length - 1, OTP_LENGTH - 1));
  };

  return (
    <FieldRoot>
      <FieldLabel id={labelId}>{label}</FieldLabel>

      <DigitsRow role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
        {digits.map((digit, index) => (
          <AuthOtpDigitInput
            key={`otp-digit-${index}`}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            hasError={Boolean(error)}
            disabled={disabled}
            aria-label={`Digito ${index + 1} do codigo 2FA`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
          />
        ))}
      </DigitsRow>

      <CountdownText id={countdownId}>{`${countdownLabel}: ${countdownValue}`}</CountdownText>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </FieldRoot>
  );
}
