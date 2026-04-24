'use client';

import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

const CheckboxInput = styled.input.attrs({
  type: 'checkbox',
  className:
    'h-4 w-4 rounded border-slate-300 text-brand focus:ring-2 focus:ring-brand/30',
})``;

interface AuthCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const CheckboxRoot = styled.label.attrs({
  className: 'inline-flex items-center gap-2 text-sm text-slate-700',
})``;

export function AuthCheckbox({ label, ...props }: AuthCheckboxProps) {
  return (
    <CheckboxRoot>
      <CheckboxInput {...props} />
      <span>{label}</span>
    </CheckboxRoot>
  );
}
