'use client';

import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

export type ListActionButtonVariant = 'edit' | 'delete' | 'save' | 'cancel';

interface ListActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ListActionButtonVariant;
}

const variantClassMap: Record<ListActionButtonVariant, string> = {
  edit: 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100',
  delete: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
  save: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
  cancel: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
};

const ListActionButtonRoot = styled.button.attrs<{ $variant: ListActionButtonVariant }>(
  ({ $variant }) => ({
    className: `inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClassMap[$variant]}`,
    type: 'button',
  }),
)``;

export function ListActionButton({
  children,
  variant,
  type,
  ...buttonProps
}: ListActionButtonProps) {
  return (
    <ListActionButtonRoot $variant={variant} type={type ?? 'button'} {...buttonProps}>
      {children}
    </ListActionButtonRoot>
  );
}
