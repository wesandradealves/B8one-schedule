'use client';

import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

interface AuthPrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = styled.button.attrs<{ $fullWidth: boolean }>({
  className:
    'inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/95 disabled:cursor-not-allowed disabled:opacity-60',
})`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  box-shadow: 0 8px 16px
    color-mix(
      in srgb,
      var(--color-brand-500, #2F46C7) 28%,
      transparent
    );
`;

const InlineSpinner = styled.span.attrs({
  className:
    'mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white',
  'aria-hidden': true,
})``;

export function AuthPrimaryButton({
  loading = false,
  fullWidth = true,
  children,
  disabled,
  ...props
}: AuthPrimaryButtonProps) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Button $fullWidth={fullWidth} disabled={isDisabled} aria-busy={loading} {...props}>
      {loading ? <InlineSpinner /> : null}
      {children}
    </Button>
  );
}
