'use client';

import Link from 'next/link';
import styled from 'styled-components';
import {
  ProtectedNavIcon,
  type ProtectedNavIconName,
} from '@/components/atoms/protected-nav-icon';

const NavItemLink = styled(Link).attrs<{ $isActive: boolean }>(({ $isActive }) => ({
  className:
    `inline-flex min-w-[132px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors lg:min-w-0 ` +
    ($isActive ? 'shadow-sm' : ''),
}))<{ $isActive: boolean }>`
  color: var(--color-background);
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-brand-500)' : 'transparent'};

  &:hover {
    background-color: ${({ $isActive }) =>
      $isActive ? 'var(--color-brand-500)' : 'color-mix(in srgb, var(--color-background) 14%, transparent)'};
  }
`;

const NavItemLabel = styled.span.attrs({
  className: 'leading-none',
})``;

export interface ProtectedNavItemProps {
  href: string;
  label: string;
  icon: ProtectedNavIconName;
  isActive: boolean;
}

export function ProtectedNavItem({ href, label, icon, isActive }: ProtectedNavItemProps) {
  return (
    <NavItemLink href={href} $isActive={isActive} data-active={isActive}>
      <ProtectedNavIcon name={icon} />
      <NavItemLabel>{label}</NavItemLabel>
    </NavItemLink>
  );
}
