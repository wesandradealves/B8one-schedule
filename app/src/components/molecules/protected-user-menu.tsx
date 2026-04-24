'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { UserInitialsBadge } from '@/components/atoms/user-initials-badge';
import { LogoutLink } from '@/components/shared/logout-link';

const UserMenuRoot = styled.div.attrs({
  className: 'relative',
})``;

const UserMenuTrigger = styled.button.attrs({
  type: 'button',
  className:
    'inline-flex items-center gap-2 rounded-full border px-2 py-1.5 text-left transition-colors hover:bg-white',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
`;

const UserName = styled.span.attrs({
  className: 'max-w-[120px] truncate text-sm font-medium',
})`
  color: var(--color-text-primary);
`;

const UserMenuChevron = styled.span.attrs<{ $open: boolean }>(({ $open }) => ({
  className:
    `inline-flex h-5 w-5 items-center justify-center text-xs transition-transform ` +
    ($open ? 'rotate-180' : ''),
  'aria-hidden': true,
}))`
  color: var(--color-text-secondary);
`;

const UserMenuDropdown = styled.div.attrs({
  className:
    'absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border bg-white p-1 shadow-lg',
  role: 'menu',
})`
  border-color: var(--color-border);
`;

const UserMenuLink = styled(Link).attrs({
  className:
    'block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface',
  role: 'menuitem',
})`
  color: var(--color-text-primary);
`;

interface ProtectedUserMenuProps {
  displayName: string;
  initials: string;
  accountHref: string;
}

export function ProtectedUserMenu({
  displayName,
  initials,
  accountHref,
}: ProtectedUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((currentValue) => !currentValue);
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) {
        return;
      }

      closeMenu();
    },
    [closeMenu],
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    },
    [closeMenu],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  return (
    <UserMenuRoot ref={rootRef}>
      <UserMenuTrigger
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <UserInitialsBadge initials={initials} />
        <UserName>{displayName}</UserName>
        <UserMenuChevron $open={isOpen}>⌄</UserMenuChevron>
      </UserMenuTrigger>

      {isOpen ? (
        <UserMenuDropdown>
          <UserMenuLink href={accountHref} onClick={closeMenu}>
            Minha conta
          </UserMenuLink>
          <LogoutLink variant="menu" onAfterLogout={closeMenu} />
        </UserMenuDropdown>
      ) : null}
    </UserMenuRoot>
  );
}
