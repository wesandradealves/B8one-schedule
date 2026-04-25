'use client';

import styled from 'styled-components';
import type { ReactElement } from 'react';

type ExamIconName =
  | 'blood'
  | 'heart'
  | 'imaging'
  | 'women'
  | 'neuro'
  | 'urine'
  | 'general';

const normalizeExamName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const resolveExamIconName = (name: string): ExamIconName => {
  const normalizedName = normalizeExamName(name);

  if (
    /hemograma|sangu|glic|colesterol|triglicer|plaqueta|leucocito|linfocito/.test(
      normalizedName,
    )
  ) {
    return 'blood';
  }

  if (/eco|ultra|raio|tomografia|ressonancia|mamografia|imagem/.test(normalizedName)) {
    return 'imaging';
  }

  if (/cardio|eletrocardiograma|holter|pressao|coracao/.test(normalizedName)) {
    return 'heart';
  }

  if (/uro|urina|renal/.test(normalizedName)) {
    return 'urine';
  }

  if (/neuro|encefalo|cerebral|eeg/.test(normalizedName)) {
    return 'neuro';
  }

  if (/gineco|obstetr|hormonio|gestac|fertilidade|feminino|feminina/.test(normalizedName)) {
    return 'women';
  }

  return 'general';
};

const IconContainer = styled.span.attrs({
  className: 'inline-flex h-11 w-11 items-center justify-center rounded-xl',
  'aria-hidden': true,
})`
  background: linear-gradient(
    145deg,
    var(--color-card-icon-bg),
    color-mix(in srgb, var(--color-brand-500) 14%, var(--color-background))
  );
  color: var(--color-card-icon-foreground);
`;

const IconSvg = styled.svg.attrs({
  className: 'h-6 w-6',
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
})`
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const iconPaths: Record<ExamIconName, ReactElement> = {
  blood: (
    <>
      <path d="M12 3.75C12 3.75 7 10 7 13.5C7 16.2614 9.23858 18.5 12 18.5C14.7614 18.5 17 16.2614 17 13.5C17 10 12 3.75 12 3.75Z" />
      <path d="M9.8 13.5H14.2" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.25C12 20.25 4.5 15.5 4.5 9.75C4.5 7.40279 6.40279 5.5 8.75 5.5C10.1438 5.5 11.3805 6.17079 12 7.20764C12.6195 6.17079 13.8562 5.5 15.25 5.5C17.5972 5.5 19.5 7.40279 19.5 9.75C19.5 15.5 12 20.25 12 20.25Z" />
    </>
  ),
  imaging: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 14L10.7 11.3C11.02 10.98 11.54 10.98 11.86 11.3L14.5 13.94L15.64 12.8C15.96 12.48 16.48 12.48 16.8 12.8L19 15" />
      <circle cx="9" cy="9" r="1.25" />
    </>
  ),
  women: (
    <>
      <path d="M12 6.25C13.7949 6.25 15.25 7.70507 15.25 9.5C15.25 11.2949 13.7949 12.75 12 12.75C10.2051 12.75 8.75 11.2949 8.75 9.5C8.75 7.70507 10.2051 6.25 12 6.25Z" />
      <path d="M12 12.75V19.75" />
      <path d="M9.5 17.25H14.5" />
    </>
  ),
  neuro: (
    <>
      <path d="M9 6.5C9 5.11929 10.1193 4 11.5 4H12.5C13.8807 4 15 5.11929 15 6.5V7.25C16.5188 7.25 17.75 8.48122 17.75 10V11C17.75 12.5188 16.5188 13.75 15 13.75V14.5C15 15.8807 13.8807 17 12.5 17H11.5C10.1193 17 9 15.8807 9 14.5V13.75C7.48122 13.75 6.25 12.5188 6.25 11V10C6.25 8.48122 7.48122 7.25 9 7.25V6.5Z" />
      <path d="M12 17V20" />
    </>
  ),
  urine: (
    <>
      <path d="M8 4.75H16" />
      <path d="M9.25 4.75V8.5C9.25 9.19036 8.69036 9.75 8 9.75V14.5C8 16.9853 10.0147 19 12.5 19H11.5C13.9853 19 16 16.9853 16 14.5V9.75C15.3096 9.75 14.75 9.19036 14.75 8.5V4.75" />
      <path d="M9 13H15" />
    </>
  ),
  general: (
    <>
      <rect x="5" y="4.5" width="14" height="15" rx="2.5" />
      <path d="M9 2.75H15V6H9V2.75Z" />
      <path d="M12 10V15" />
      <path d="M9.5 12.5H14.5" />
    </>
  ),
};

interface ExamNameIconProps {
  examName: string;
}

export function ExamNameIcon({ examName }: ExamNameIconProps) {
  const iconName = resolveExamIconName(examName);

  return (
    <IconContainer data-testid={`exam-name-icon-${iconName}`}>
      <IconSvg>{iconPaths[iconName]}</IconSvg>
    </IconContainer>
  );
}
