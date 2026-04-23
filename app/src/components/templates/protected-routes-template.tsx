import styled from 'styled-components';
import type { ReactNode } from 'react';

const ProtectedTemplateRoot = styled.section.attrs({
  className: 'min-h-screen w-full bg-white',
})``;

const ProtectedTemplateContent = styled.div.attrs({
  className: 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8',
})``;

interface ProtectedRoutesTemplateProps {
  children: ReactNode;
}

export function ProtectedRoutesTemplate({ children }: ProtectedRoutesTemplateProps) {
  return (
    <ProtectedTemplateRoot>
      <ProtectedTemplateContent>{children}</ProtectedTemplateContent>
    </ProtectedTemplateRoot>
  );
}
