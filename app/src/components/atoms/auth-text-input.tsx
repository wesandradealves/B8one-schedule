'use client';

import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface AuthTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  hasLeftIcon?: boolean;
}

const Input = styled.input.attrs<{ $hasError: boolean; $hasLeftIcon: boolean }>(
  ({ $hasError, $hasLeftIcon }) => ({
    className: `h-11 w-full rounded-xl border bg-white text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
      $hasLeftIcon ? 'pl-10 pr-3' : 'px-3'
    } ${
    $hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-200 focus:border-brand'
  }`,
  }),
)``;

export function AuthTextInput({
  hasError = false,
  hasLeftIcon = false,
  ...props
}: AuthTextInputProps) {
  return <Input $hasError={hasError} $hasLeftIcon={hasLeftIcon} {...props} />;
}
