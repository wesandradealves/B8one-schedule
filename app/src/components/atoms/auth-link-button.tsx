'use client';

import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

const Button = styled.button.attrs({
  className:
    'inline-flex items-center justify-center text-sm font-medium text-brand underline-offset-2 transition-colors hover:text-brand/80 hover:underline disabled:cursor-not-allowed disabled:opacity-60',
  type: 'button',
})``;

export function AuthLinkButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button {...props} />;
}
