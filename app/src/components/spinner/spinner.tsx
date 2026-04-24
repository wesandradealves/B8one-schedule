'use client';

import { useLoader } from '@/hooks/useLoader';
import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';
import {
  Overlay,
  SpinnerLogoSlot,
  SpinnerRing,
  SpinnerShell,
} from '@/components/spinner/styles';

export default function Spinner() {
  const { isLoading } = useLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <Overlay role="status" aria-live="polite" aria-label="Carregando">
      <SpinnerShell>
        <SpinnerRing />
        <SpinnerLogoSlot>
          <AuthBrandLogo tone="white" size="md" iconOnly />
        </SpinnerLogoSlot>
      </SpinnerShell>
    </Overlay>
  );
}
