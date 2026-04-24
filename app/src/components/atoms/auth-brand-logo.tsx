'use client';

import styled from 'styled-components';

type AuthBrandLogoTone = 'primary' | 'white';
type AuthBrandLogoSize = 'sm' | 'md' | 'lg';

interface AuthBrandLogoProps {
  tone?: AuthBrandLogoTone;
  size?: AuthBrandLogoSize;
  iconOnly?: boolean;
  className?: string;
}

const toneClasses: Record<AuthBrandLogoTone, string> = {
  primary: 'text-brand',
  white: 'text-white',
};

const sizeClasses: Record<AuthBrandLogoSize, string> = {
  sm: 'gap-2 text-base',
  md: 'gap-2.5 text-xl',
  lg: 'gap-3 text-2xl',
};

const logoIconSizeClasses: Record<AuthBrandLogoSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
};

const LogoRoot = styled.div.attrs<{ $tone: AuthBrandLogoTone; $size: AuthBrandLogoSize }>(
  ({ $tone, $size }) => ({
    className: `inline-flex items-center justify-center font-semibold tracking-tight ${toneClasses[$tone]} ${sizeClasses[$size]}`,
  }),
)``;

const LogoText = styled.span.attrs({
  className: 'leading-none',
})``;

export function AuthBrandLogo({
  tone = 'primary',
  size = 'md',
  iconOnly = false,
  className,
}: AuthBrandLogoProps) {
  return (
    <LogoRoot $tone={tone} $size={size} className={className}>
      <svg
        className={logoIconSizeClasses[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="6"
          y="5"
          width="20"
          height="24"
          rx="4"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <rect x="11" y="2.5" width="10" height="5" rx="2.5" fill="currentColor" />
        <path
          d="M10 16.5H14L16 13.5L18 19.5L20 16.5H22"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!iconOnly ? <LogoText>ExamPoint</LogoText> : null}
    </LogoRoot>
  );
}
