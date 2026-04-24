'use client';

import { useMemo } from 'react';
import styled from 'styled-components';

const PaginationRoot = styled.nav.attrs({
  className: 'flex items-center gap-2',
  'aria-label': 'Paginação da listagem',
})``;

const PaginationButton = styled.button.attrs<{ $isActive: boolean }>(({ $isActive }) => ({
  className:
    'inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  type: 'button',
  'data-active': $isActive,
}))<{ $isActive: boolean }>`
  border-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-brand-500)' : 'var(--color-border)'};
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-brand-500)' : 'var(--color-background)'};
  color: ${({ $isActive }) => ($isActive ? 'var(--color-background)' : 'var(--color-text-primary)')};
`;

interface ListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const createPages = (totalPages: number): number[] => {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
};

export function ListPagination({ page, totalPages, onPageChange }: ListPaginationProps) {
  const pages = useMemo(() => createPages(totalPages), [totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationRoot>
      {pages.map((pageItem) => {
        const isActive = pageItem === page;

        return (
          <PaginationButton
            key={pageItem}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Ir para página ${pageItem}`}
            $isActive={isActive}
            disabled={isActive}
            onClick={() => onPageChange(pageItem)}
          >
            {pageItem}
          </PaginationButton>
        );
      })}
    </PaginationRoot>
  );
}
