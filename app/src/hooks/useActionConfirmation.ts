'use client';

import { useCallback, useMemo, useState } from 'react';

export interface ActionConfirmationState<TItem> {
  isOpen: boolean;
  target: TItem | null;
  openConfirmation: (target: TItem) => void;
  closeConfirmation: () => void;
}

export const useActionConfirmation = <TItem>(): ActionConfirmationState<TItem> => {
  const [target, setTarget] = useState<TItem | null>(null);

  const openConfirmation = useCallback((nextTarget: TItem) => {
    setTarget(nextTarget);
  }, []);

  const closeConfirmation = useCallback(() => {
    setTarget(null);
  }, []);

  const isOpen = useMemo(() => target !== null, [target]);

  return {
    isOpen,
    target,
    openConfirmation,
    closeConfirmation,
  };
};
