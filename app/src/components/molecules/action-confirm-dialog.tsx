'use client';

import { useCallback, type MouseEvent } from 'react';
import styled from 'styled-components';
import { ListActionButton, type ListActionButtonVariant } from '@/components/atoms/list-action-button';

const Overlay = styled.div.attrs({
  className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4',
  role: 'presentation',
})``;

const DialogCard = styled.section.attrs({
  className: 'w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl',
  role: 'dialog',
  'aria-modal': true,
})`
  border-color: var(--color-border);
`;

const DialogTitle = styled.h3.attrs({
  className: 'text-base font-semibold',
})`
  color: var(--color-text-primary);
`;

const DialogDescription = styled.p.attrs({
  className: 'mt-2 text-sm',
})`
  color: var(--color-text-secondary);
`;

const DialogActions = styled.div.attrs({
  className: 'mt-5 flex items-center justify-end gap-2',
})``;

interface ActionConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: Extract<ListActionButtonVariant, 'save' | 'delete'>;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Prosseguir',
  cancelLabel = 'Cancelar',
  confirmVariant = 'delete',
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ActionConfirmDialogProps) {
  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || isSubmitting) {
        return;
      }

      onCancel();
    },
    [isSubmitting, onCancel],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <DialogCard aria-labelledby="action-confirm-title" aria-describedby="action-confirm-description">
        <DialogTitle id="action-confirm-title">{title}</DialogTitle>
        <DialogDescription id="action-confirm-description">{description}</DialogDescription>

        <DialogActions>
          <ListActionButton disabled={isSubmitting} variant="cancel" onClick={onCancel}>
            {cancelLabel}
          </ListActionButton>
          <ListActionButton disabled={isSubmitting} variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </ListActionButton>
        </DialogActions>
      </DialogCard>
    </Overlay>
  );
}
