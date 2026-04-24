'use client';

import styled from 'styled-components';
import {
  AuthFieldIcon,
  type AuthFieldIconName,
} from '@/components/atoms/auth-field-icon';
import { AuthTextInput } from '@/components/atoms/auth-text-input';
import type { InputHTMLAttributes } from 'react';

interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: AuthFieldIconName;
  error?: string;
}

const FieldRoot = styled.div.attrs({
  className: 'flex w-full flex-col gap-1.5',
})``;

const FieldLabel = styled.label.attrs({
  className: 'text-xs font-medium text-slate-700',
})``;

const InputShell = styled.div.attrs({
  className: 'relative',
})``;

const IconSlot = styled.div.attrs({
  className: 'pointer-events-none absolute inset-y-0 left-3 flex items-center',
})``;

const FieldError = styled.span.attrs({
  className: 'text-xs text-red-600',
})``;

export function AuthFormField({
  label,
  id,
  leftIcon,
  error,
  ...inputProps
}: AuthFormFieldProps) {
  const inputId = id ?? inputProps.name;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [inputProps['aria-describedby'], errorId]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <FieldRoot>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <InputShell>
        {leftIcon ? (
          <IconSlot>
            <AuthFieldIcon name={leftIcon} />
          </IconSlot>
        ) : null}
        <AuthTextInput
          id={inputId}
          hasError={Boolean(error)}
          hasLeftIcon={Boolean(leftIcon)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...inputProps}
        />
      </InputShell>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </FieldRoot>
  );
}
