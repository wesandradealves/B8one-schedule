'use client';

import styled from 'styled-components';

interface AuthStepHeaderProps {
  title: string;
  description: string;
}

const HeaderRoot = styled.header.attrs({
  className: 'flex flex-col gap-2 text-center',
})``;

const HeaderTitle = styled.h1.attrs({
  className: 'text-2xl font-semibold text-slate-900',
})``;

const HeaderDescription = styled.p.attrs({
  className: 'text-sm text-slate-600',
})``;

export function AuthStepHeader({ title, description }: AuthStepHeaderProps) {
  return (
    <HeaderRoot>
      <HeaderTitle>{title}</HeaderTitle>
      <HeaderDescription>{description}</HeaderDescription>
    </HeaderRoot>
  );
}
