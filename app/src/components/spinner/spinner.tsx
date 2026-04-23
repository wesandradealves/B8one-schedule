'use client';

import { useLoader } from '@/hooks/useLoader';
import { Dot, Overlay } from '@/components/spinner/styles';

export default function Spinner() {
  const { isLoading } = useLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <Overlay role="status" aria-live="polite" aria-label="Carregando">
      <Dot />
    </Overlay>
  );
}
