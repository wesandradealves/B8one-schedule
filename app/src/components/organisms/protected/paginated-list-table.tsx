'use client';

import styled from 'styled-components';
import { useMemo, type ReactNode } from 'react';
import { ListPagination } from '@/components/molecules/list-pagination';

const TableShell = styled.section.attrs({
  className: 'mt-6 overflow-hidden rounded-2xl border bg-white',
})`
  border-color: var(--color-border);
`;

const TableHeader = styled.header.attrs({
  className: 'flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
})`
  border-color: var(--color-border);
`;

const HeaderMeta = styled.p.attrs({
  className: 'text-xs sm:text-sm',
})`
  color: var(--color-text-secondary);
`;

const HeaderRight = styled.div.attrs({
  className: 'flex items-center gap-2 self-start sm:self-auto',
})``;

const TableScroll = styled.div.attrs({
  className: 'w-full overflow-x-auto',
})``;

const Table = styled.table.attrs({
  className: 'min-w-full border-collapse',
})``;

const TableHeadCell = styled.th.attrs<{ $align: 'left' | 'center' | 'right' }>(({ $align }) => ({
  className: `border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
    $align === 'center' ? 'text-center' : $align === 'right' ? 'text-right' : 'text-left'
  }`,
  scope: 'col',
}))<{ $align: 'left' | 'center' | 'right' }>`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
`;

const TableBodyRow = styled.tr.attrs({
  className: 'border-b last:border-b-0',
})`
  border-color: var(--color-border);
`;

const TableBodyCell = styled.td.attrs<{ $align: 'left' | 'center' | 'right' }>(({ $align }) => ({
  className: `px-4 py-3 align-middle text-sm ${
    $align === 'center' ? 'text-center' : $align === 'right' ? 'text-right' : 'text-left'
  }`,
}))<{ $align: 'left' | 'center' | 'right' }>`
  color: var(--color-text-primary);
`;

const EmptyState = styled.p.attrs({
  className: 'px-4 py-8 text-center text-sm',
})`
  color: var(--color-text-secondary);
`;

const LoadingSkeletonLine = styled.div.attrs<{ $widthClass: string }>(({ $widthClass }) => ({
  className: `h-4 animate-pulse rounded bg-slate-200 ${$widthClass}`,
}))``;

const TableFooter = styled.footer.attrs({
  className: 'flex items-center justify-between gap-3 border-t px-4 py-3',
})`
  border-color: var(--color-border);
`;

const FooterMeta = styled.p.attrs({
  className: 'text-xs sm:text-sm',
})`
  color: var(--color-text-secondary);
`;

export interface PaginatedListColumn<TItem> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render: (item: TItem) => ReactNode;
}

interface PaginatedListTableProps<TItem> {
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  rows: TItem[];
  columns: PaginatedListColumn<TItem>[];
  emptyMessage: string;
  getRowKey: (item: TItem) => string;
  onPageChange: (page: number) => void;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
}

export function PaginatedListTable<TItem>({
  total,
  page,
  totalPages,
  isLoading,
  rows,
  columns,
  emptyMessage,
  getRowKey,
  onPageChange,
  headerLeft,
  headerRight,
}: PaginatedListTableProps<TItem>) {
  const footerText = useMemo(() => {
    return `Página ${page} de ${totalPages || 1}`;
  }, [page, totalPages]);

  const loadingRows = useMemo(() => {
    return [1, 2, 3, 4].map((rowIndex) => (
      <TableBodyRow key={`loading-${rowIndex}`}>
        {columns.map((column) => (
          <TableBodyCell key={`${column.key}-${rowIndex}`} $align={column.align ?? 'left'}>
            <LoadingSkeletonLine $widthClass="w-full" />
          </TableBodyCell>
        ))}
      </TableBodyRow>
    ));
  }, [columns]);

  return (
    <TableShell>
      {headerLeft || headerRight ? (
        <TableHeader>
          <div>{headerLeft ? headerLeft : <HeaderMeta>{total} itens</HeaderMeta>}</div>
          {headerRight ? <HeaderRight>{headerRight}</HeaderRight> : null}
        </TableHeader>
      ) : null}

      <TableScroll>
        <Table>
          <thead>
            <tr>
              {columns.map((column) => (
                <TableHeadCell key={column.key} $align={column.align ?? 'left'}>
                  {column.header}
                </TableHeadCell>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading
              ? loadingRows
              : rows.map((row) => {
                  const rowKey = getRowKey(row);

                  return (
                    <TableBodyRow key={rowKey}>
                      {columns.map((column) => (
                        <TableBodyCell
                          key={`${column.key}-${rowKey}`}
                          $align={column.align ?? 'left'}
                        >
                          {column.render(row)}
                        </TableBodyCell>
                      ))}
                    </TableBodyRow>
                  );
                })}
          </tbody>
        </Table>
      </TableScroll>

      {!isLoading && rows.length === 0 ? <EmptyState>{emptyMessage}</EmptyState> : null}

      <TableFooter>
        <FooterMeta>{footerText}</FooterMeta>
        <ListPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </TableFooter>
    </TableShell>
  );
}
