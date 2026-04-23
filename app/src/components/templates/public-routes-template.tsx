import styled from 'styled-components';
import type { ReactNode } from 'react';

const PublicTemplateRoot = styled.section.attrs({
  className:
    'flex min-h-screen w-full items-center justify-center bg-white px-4 py-8 sm:px-6 lg:px-8',
})``;

const PublicTemplateContent = styled.div.attrs({
  className: 'w-full max-w-md',
})``;

interface PublicRoutesTemplateProps {
  children: ReactNode;
}

export function PublicRoutesTemplate({ children }: PublicRoutesTemplateProps) {
  return (
    <PublicTemplateRoot>
      <PublicTemplateContent>{children}</PublicTemplateContent>
    </PublicTemplateRoot>
  );
}
