import { fireEvent, render, screen } from '@testing-library/react';
import { ActionConfirmDialog } from '@/components/molecules/action-confirm-dialog';

describe('ActionConfirmDialog', () => {
  it('should not render when closed', () => {
    render(
      <ActionConfirmDialog
        description="Descrição"
        isOpen={false}
        title="Título"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render title, description and trigger actions', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ActionConfirmDialog
        description="Deseja remover o item?"
        isOpen
        title="Confirmar exclusão"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText('Deseja remover o item?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Prosseguir' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should close on overlay click when not submitting', () => {
    const onCancel = jest.fn();

    render(
      <ActionConfirmDialog
        description="Descrição"
        isOpen
        title="Título"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('presentation'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should keep actions blocked while submitting', () => {
    const onCancel = jest.fn();

    render(
      <ActionConfirmDialog
        description="Descrição"
        isOpen
        isSubmitting
        title="Título"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    const confirmButton = screen.getByRole('button', { name: 'Prosseguir' });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    fireEvent.click(screen.getByRole('presentation'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
