'use client';

import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';
import { ProtectedNavItem } from '@/components/molecules/protected-nav-item';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { usePathname } from 'next/navigation';

const SidebarRoot = styled.aside.attrs({
  className: 'w-full shrink-0 px-3 py-3 lg:w-64 lg:px-4 lg:py-4',
})`
  background: linear-gradient(
    180deg,
    var(--color-brand-700) 0%,
    var(--color-brand-900) 100%
  );
`;

const SidebarBrand = styled.div.attrs({
  className: 'flex items-center rounded-2xl bg-white/10 px-3 py-3',
})``;

const SidebarNav = styled.nav.attrs({
  className:
    'mt-4 flex w-full gap-2 overflow-x-auto pb-1 lg:mt-6 lg:flex-col lg:overflow-visible lg:pb-0',
  'aria-label': 'Navegação principal',
})``;

const isActiveRoute = (pathname: string | null, href: string): boolean => {
  if (!pathname) {
    return false;
  }

  if (href === '/app') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function ProtectedSidebar() {
  const pathname = usePathname();
  const navigationItems = useProtectedNavigation();
  const isRouteActive = useCallback(
    (href: string) => isActiveRoute(pathname, href),
    [pathname],
  );
  const renderedItems = useMemo(() => {
    return navigationItems.map((item) => (
      <ProtectedNavItem
        key={item.href}
        href={item.href}
        icon={item.icon}
        label={item.label}
        isActive={isRouteActive(item.href)}
      />
    ));
  }, [isRouteActive, navigationItems]);

  return (
    <SidebarRoot>
      <SidebarBrand>
        <AuthBrandLogo tone="white" size="md" />
      </SidebarBrand>

      <SidebarNav>{renderedItems}</SidebarNav>
    </SidebarRoot>
  );
}
