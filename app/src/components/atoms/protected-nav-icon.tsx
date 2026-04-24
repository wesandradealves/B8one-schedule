'use client';

import styled from 'styled-components';
import type { ReactElement } from 'react';

export type ProtectedNavIconName = 'home' | 'exams' | 'appointments' | 'users';

interface ProtectedNavIconProps {
  name: ProtectedNavIconName;
}

const IconSvg = styled.svg.attrs({
  className: 'h-4 w-4',
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
})`
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const iconPaths: Record<ProtectedNavIconName, ReactElement> = {
  home: (
    <>
      <path d="M4 10.5L12 4L20 10.5V19.5H4V10.5Z" />
      <path d="M9.5 19.5V13.5H14.5V19.5" />
    </>
  ),
  exams: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 2.75H15V6H9V2.75Z" />
      <path d="M8 11H16" />
      <path d="M8 15H13" />
    </>
  ),
  appointments: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 3V8" />
      <path d="M16 3V8" />
      <path d="M4 10H20" />
      <path d="M9 14H12V17" />
    </>
  ),
  users: (
    <>
      <path d="M16 8.5C16 10.433 14.433 12 12.5 12C10.567 12 9 10.433 9 8.5C9 6.567 10.567 5 12.5 5C14.433 5 16 6.567 16 8.5Z" />
      <path d="M5 19C5.8 16.2 8.2 14.5 12.5 14.5C16.8 14.5 19.2 16.2 20 19" />
    </>
  ),
};

export function ProtectedNavIcon({ name }: ProtectedNavIconProps) {
  return <IconSvg data-testid={`protected-nav-icon-${name}`}>{iconPaths[name]}</IconSvg>;
}
