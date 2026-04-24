'use client';

import { useCallback } from 'react';
import styled from 'styled-components';
import { useLogout } from '@/hooks/useLogout';

type LogoutLinkVariant = 'inline' | 'menu';

const variantClasses: Record<LogoutLinkVariant, string> = {
  inline: 'text-sm font-medium text-brand underline underline-offset-2 hover:no-underline',
  menu: 'block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[color:var(--color-danger)] no-underline transition-colors hover:bg-surface',
};

const LogoutButton = styled.button.attrs<{ $variant: LogoutLinkVariant }>(({ $variant }) => ({
  type: 'button',
  className: variantClasses[$variant],
}))``;

interface LogoutLinkProps {
  className?: string;
  label?: string;
  onAfterLogout?: () => void;
  variant?: LogoutLinkVariant;
}

export function LogoutLink({
  className,
  label = 'Sair da conta',
  onAfterLogout,
  variant = 'inline',
}: LogoutLinkProps) {
  const handleLogout = useLogout();

  const onClick = useCallback(() => {
    handleLogout();
    onAfterLogout?.();
  }, [handleLogout, onAfterLogout]);

  return (
    <LogoutButton className={className} onClick={onClick} $variant={variant}>
      {label}
    </LogoutButton>
  );
}
