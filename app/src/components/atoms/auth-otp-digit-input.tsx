'use client';

import styled from 'styled-components';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface AuthOtpDigitInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const OtpDigitInput = styled.input.attrs<{ $hasError: boolean }>(({ $hasError }) => ({
  className: `h-12 w-12 rounded-xl border bg-white text-center text-xl font-semibold text-slate-900 outline-none transition-colors ${
    $hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-300 focus:border-brand'
  }`,
}))``;

export const AuthOtpDigitInput = forwardRef<HTMLInputElement, AuthOtpDigitInputProps>(
  ({ hasError = false, ...props }, ref) => {
    return <OtpDigitInput ref={ref} $hasError={hasError} {...props} />;
  },
);

AuthOtpDigitInput.displayName = 'AuthOtpDigitInput';
