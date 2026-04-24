import { fireEvent, render, screen } from '@testing-library/react';
import {
  PaginatedListTable,
  type PaginatedListColumn,
} from '@/components/organisms/protected/paginated-list-table';

interface RowItem {
  id: string;
  name: string;
}

const columns: PaginatedListColumn<RowItem>[] = [
  {
    key: 'name',
    header: 'Nome',
    render: (item) => item.name,
  },
];

describe('PaginatedListTable', () => {
  it('should render loading state', () => {
    render(
      <PaginatedListTable<RowItem>
        columns={columns}
        emptyMessage="Sem dados"
        getRowKey={(item) => item.id}
        isLoading
        page={1}
        rows={[]}
        total={0}
        totalPages={0}
        onPageChange={jest.fn()}
      />,
    );

    expect(screen.queryByText('Sem dados')).not.toBeInTheDocument();
  });

  it('should render rows, headerLeft/headerRight and pagination callback', () => {
    const onPageChange = jest.fn();

    render(
      <PaginatedListTable<RowItem>
        columns={columns}
        emptyMessage="Sem dados"
        getRowKey={(item) => item.id}
        headerLeft={<div>total: 2</div>}
        headerRight={<div>filtro</div>}
        isLoading={false}
        page={1}
        rows={[
          { id: '1', name: 'Linha 1' },
          { id: '2', name: 'Linha 2' },
        ]}
        total={2}
        totalPages={2}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('total: 2')).toBeInTheDocument();
    expect(screen.getByText('filtro')).toBeInTheDocument();
    expect(screen.getByText('Linha 1')).toBeInTheDocument();
    expect(screen.getByText('Linha 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir para página 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should render empty message when table is not loading', () => {
    render(
      <PaginatedListTable<RowItem>
        columns={columns}
        emptyMessage="Sem dados"
        getRowKey={(item) => item.id}
        isLoading={false}
        page={1}
        rows={[]}
        total={0}
        totalPages={0}
        onPageChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
  });
});
