'use client';

import styled from 'styled-components';
import { ProtectedUserMenu } from '@/components/molecules/protected-user-menu';
import { useUserDisplay } from '@/hooks/useUserDisplay';
import { APP_ROUTES } from '@/utils/route';

const TopbarRoot = styled.header.attrs({
  className: 'flex w-full items-center justify-end border-b px-4 py-3 sm:px-6',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
`;

export function ProtectedTopbar() {
  const { displayName, initials } = useUserDisplay();

  return (
    <TopbarRoot>
      <ProtectedUserMenu
        displayName={displayName}
        initials={initials}
        accountHref={APP_ROUTES.myAccount}
      />
    </TopbarRoot>
  );
}
