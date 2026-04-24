'use client';

import styled from 'styled-components';
import { ProtectedUserMenu } from '@/components/molecules/protected-user-menu';
import { useUserDisplay } from '@/hooks/useUserDisplay';
import { APP_ROUTES } from '@/utils/route';
import { env } from '@/utils/env';

const TopbarRoot = styled.header.attrs({
  className: 'flex w-full items-center justify-between border-b px-4 py-3 sm:px-6',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
`;

const TopbarTitle = styled.h1.attrs({
  className: 'text-base font-semibold tracking-wide sm:text-lg',
})`
  color: var(--color-text-primary);
`;

const APP_TITLE = env.APP_NAME;

export function ProtectedTopbar() {
  const { displayName, initials } = useUserDisplay();

  return (
    <TopbarRoot>
      <TopbarTitle>{APP_TITLE}</TopbarTitle>
      <ProtectedUserMenu
        displayName={displayName}
        initials={initials}
        accountHref={APP_ROUTES.myAccount}
      />
    </TopbarRoot>
  );
}
