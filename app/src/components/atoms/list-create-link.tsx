'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { ReactNode } from 'react';

interface ListCreateLinkProps {
  href: string;
  children: ReactNode;
}

const ListCreateLinkRoot = styled(Link).attrs({
  className:
    'inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors hover:bg-brand-700',
})`
  border-color: var(--color-brand-500);
  background: var(--color-brand-500);
  color: var(--color-background);
`;

export function ListCreateLink({ href, children }: ListCreateLinkProps) {
  return <ListCreateLinkRoot href={href}>{children}</ListCreateLinkRoot>;
}
