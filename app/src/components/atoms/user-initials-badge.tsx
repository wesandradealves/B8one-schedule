'use client';

import styled from 'styled-components';

const InitialsBadgeRoot = styled.span.attrs({
  className:
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold uppercase text-white',
})``;

const InitialsBadgeSkeleton = styled.span.attrs({
  className: 'h-3.5 w-3.5 rounded-full bg-white/60 animate-pulse',
  'aria-hidden': true,
})``;

interface UserInitialsBadgeProps {
  initials: string;
  className?: string;
}

export function UserInitialsBadge({ initials, className }: UserInitialsBadgeProps) {
  const trimmedInitials = initials.trim();

  return (
    <InitialsBadgeRoot className={className} aria-label={trimmedInitials ? 'Iniciais do usuário' : 'Carregando usuário'}>
      {trimmedInitials ? trimmedInitials : <InitialsBadgeSkeleton />}
    </InitialsBadgeRoot>
  );
}
