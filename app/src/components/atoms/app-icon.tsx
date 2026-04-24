'use client';

import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';

type AppIconTone = 'primary' | 'white';
type AppIconSize = 'sm' | 'md' | 'lg';

interface AppIconProps {
  tone?: AppIconTone;
  size?: AppIconSize;
  className?: string;
}

export function AppIcon({ tone = 'primary', size = 'md', className }: AppIconProps) {
  return <AuthBrandLogo tone={tone} size={size} iconOnly className={className} />;
}
