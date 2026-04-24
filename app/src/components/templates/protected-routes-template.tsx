import styled from 'styled-components';
import type { ReactNode } from 'react';
import { ProtectedFooter } from '@/components/organisms/protected/protected-footer';
import { ProtectedSidebar } from '@/components/organisms/protected/protected-sidebar';
import { ProtectedTopbar } from '@/components/organisms/protected/protected-topbar';

const ProtectedTemplateRoot = styled.section.attrs({
  className: 'min-h-screen w-full p-0',
})`
  background-color: var(--color-surface);
`;

const ProtectedTemplateFrame = styled.div.attrs({
  className:
    'flex min-h-screen w-full flex-col overflow-hidden rounded-none border-0 shadow-none lg:flex-row',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
`;

const ProtectedTemplateMain = styled.div.attrs({
  className: 'flex min-h-full min-w-0 flex-1 flex-col',
})``;

const ProtectedTemplateContent = styled.div.attrs({
  className: 'flex-1 px-4 py-4 sm:px-6 sm:py-6',
})``;

interface ProtectedRoutesTemplateProps {
  children: ReactNode;
}

export function ProtectedRoutesTemplate({ children }: ProtectedRoutesTemplateProps) {
  return (
    <ProtectedTemplateRoot>
      <ProtectedTemplateFrame>
        <ProtectedSidebar />

        <ProtectedTemplateMain>
          <ProtectedTopbar />
          <ProtectedTemplateContent>{children}</ProtectedTemplateContent>
          <ProtectedFooter />
        </ProtectedTemplateMain>
      </ProtectedTemplateFrame>
    </ProtectedTemplateRoot>
  );
}
