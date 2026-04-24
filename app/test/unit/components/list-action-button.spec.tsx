import { fireEvent, render, screen } from '@testing-library/react';
import { ListActionButton } from '@/components/atoms/list-action-button';

describe('ListActionButton', () => {
  it('should render variants and trigger click', () => {
    const onClick = jest.fn();

    render(
      <>
        <ListActionButton variant="edit" onClick={onClick}>
          Editar
        </ListActionButton>
        <ListActionButton variant="delete">Excluir</ListActionButton>
        <ListActionButton variant="save">Salvar</ListActionButton>
        <ListActionButton variant="cancel">Cancelar</ListActionButton>
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('should keep button disabled when disabled prop is true', () => {
    render(
      <ListActionButton disabled variant="delete">
        Excluir
      </ListActionButton>,
    );

    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();
  });
});
