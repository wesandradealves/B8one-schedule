'use client';

import styled from 'styled-components';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const sharedControlClasses =
  'h-9 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-100';

const ListInputRoot = styled.input.attrs({
  className: sharedControlClasses,
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-primary);
`;

const ListSelectRoot = styled.select.attrs({
  className: sharedControlClasses,
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-primary);
`;

const ListTextareaRoot = styled.textarea.attrs({
  className: 'min-h-9 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-100',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-primary);
`;

export type ListFormInputProps = InputHTMLAttributes<HTMLInputElement>;
export type ListFormSelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export type ListFormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ListFormInput({ type = 'text', ...inputProps }: ListFormInputProps) {
  return <ListInputRoot type={type} {...inputProps} />;
}

export function ListFormSelect({ children, ...selectProps }: ListFormSelectProps) {
  return <ListSelectRoot {...selectProps}>{children}</ListSelectRoot>;
}

export function ListFormTextarea({ rows = 2, ...textareaProps }: ListFormTextareaProps) {
  return <ListTextareaRoot rows={rows} {...textareaProps} />;
}
