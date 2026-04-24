'use client';

import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ListActionButton } from '@/components/atoms/list-action-button';
import { ListFormInput, ListFormSelect } from '@/components/atoms/list-form-controls';
import { ActionConfirmDialog } from '@/components/molecules/action-confirm-dialog';
import {
  PaginatedListTable,
  type PaginatedListColumn,
} from '@/components/organisms/protected/paginated-list-table';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { useActionConfirmation } from '@/hooks/useActionConfirmation';
import { useExamsList } from '@/hooks/useExamsList';
import type { SortOrder } from '@/types/api';
import type { Exam } from '@/types/exam';
import { formatCurrencyFromCents } from '@/utils/format';

const Controls = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const DescriptionText = styled.span.attrs({
  className: 'line-clamp-2 block min-w-[180px] text-sm',
})`
  color: var(--color-text-secondary);
`;

const FilterWrapper = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const FilterLabel = styled.label.attrs({
  className: 'text-xs font-medium sm:text-sm',
})`
  color: var(--color-text-secondary);
`;

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'DESC', label: 'Mais recentes' },
  { value: 'ASC', label: 'Mais antigos' },
];

export function ExamsListSection() {
  const {
    exams,
    page,
    total,
    totalPages,
    isLoading,
    isSaving,
    sortOrder,
    canManageExams,
    editingExamId,
    editForm,
    setPage,
    updateSortOrder,
    startEdit,
    cancelEdit,
    setEditField,
    saveEdit,
    deleteExam,
  } = useExamsList();
  const {
    isOpen,
    target: targetExamToDelete,
    openConfirmation,
    closeConfirmation,
  } = useActionConfirmation<Exam>();

  const handleRequestDeleteExam = useCallback(
    (exam: Exam) => {
      openConfirmation(exam);
    },
    [openConfirmation],
  );

  const handleConfirmDeleteExam = useCallback(async () => {
    if (!targetExamToDelete) {
      return;
    }

    closeConfirmation();
    await deleteExam(targetExamToDelete.id);
  }, [closeConfirmation, deleteExam, targetExamToDelete]);

  const columns = useMemo<PaginatedListColumn<Exam>[]>(() => {
    const baseColumns: PaginatedListColumn<Exam>[] = [
      {
        key: 'name',
        header: 'Exame',
        render: (exam) => {
          if (editingExamId === exam.id && editForm) {
            return (
              <ListFormInput
                aria-label="Nome do exame"
                disabled={isSaving}
                value={editForm.name}
                onChange={(event) => setEditField('name', event.target.value)}
              />
            );
          }

          return <span className="font-semibold">{exam.name}</span>;
        },
      },
      {
        key: 'description',
        header: 'Descrição',
        render: (exam) => {
          if (editingExamId === exam.id && editForm) {
            return (
              <ListFormInput
                aria-label="Descrição do exame"
                disabled={isSaving}
                value={editForm.description}
                onChange={(event) => setEditField('description', event.target.value)}
              />
            );
          }

          return <DescriptionText>{exam.description || '-'}</DescriptionText>;
        },
      },
      {
        key: 'duration',
        header: 'Duração (min)',
        align: 'center',
        render: (exam) => {
          if (editingExamId === exam.id && editForm) {
            return (
              <ListFormInput
                aria-label="Duração do exame"
                disabled={isSaving}
                min={1}
                step={1}
                type="number"
                value={editForm.durationMinutes}
                onChange={(event) => setEditField('durationMinutes', event.target.value)}
              />
            );
          }

          return String(exam.durationMinutes);
        },
      },
      {
        key: 'price',
        header: 'Valor',
        align: 'right',
        render: (exam) => {
          if (editingExamId === exam.id && editForm) {
            return (
              <ListFormInput
                aria-label="Valor do exame"
                disabled={isSaving}
                min={1}
                step={1}
                type="number"
                value={editForm.priceCents}
                onChange={(event) => setEditField('priceCents', event.target.value)}
              />
            );
          }

          return formatCurrencyFromCents(exam.priceCents);
        },
      },
    ];

    if (!canManageExams) {
      return baseColumns;
    }

    const actionColumn: PaginatedListColumn<Exam> = {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (exam) => {
        if (editingExamId === exam.id) {
          return (
            <Controls>
              <ListActionButton disabled={isSaving} variant="save" onClick={() => void saveEdit()}>
                Salvar
              </ListActionButton>
              <ListActionButton disabled={isSaving} variant="cancel" onClick={cancelEdit}>
                Cancelar
              </ListActionButton>
            </Controls>
          );
        }

        return (
          <Controls>
            <ListActionButton disabled={isSaving} variant="edit" onClick={() => startEdit(exam)}>
              Editar
            </ListActionButton>
            <ListActionButton
              disabled={isSaving}
              variant="delete"
              onClick={() => handleRequestDeleteExam(exam)}
            >
              Excluir
            </ListActionButton>
          </Controls>
        );
      },
    };

    return [...baseColumns, actionColumn];
  }, [
    canManageExams,
    cancelEdit,
    editForm,
    editingExamId,
    handleRequestDeleteExam,
    isSaving,
    saveEdit,
    setEditField,
    startEdit,
  ]);

  const headerRight = useMemo(() => {
    return (
      <FilterWrapper>
        <FilterLabel htmlFor="exams-sort-order">Ordenar</FilterLabel>
        <ListFormSelect
          id="exams-sort-order"
          value={sortOrder}
          onChange={(event) => updateSortOrder(event.target.value as SortOrder)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ListFormSelect>
      </FilterWrapper>
    );
  }, [sortOrder, updateSortOrder]);

  return (
    <PageContainer>
      <PageTitle>Exames</PageTitle>
      <PageDescription>
        Listagem padronizada com paginação de 8 itens por página.
      </PageDescription>

      <PaginatedListTable
        columns={columns}
        emptyMessage="Nenhum exame encontrado para os filtros atuais."
        getRowKey={(exam) => exam.id}
        headerRight={headerRight}
        isLoading={isLoading}
        page={page}
        rows={exams}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ActionConfirmDialog
        confirmLabel="Excluir"
        description={
          targetExamToDelete
            ? `Deseja remover o exame "${targetExamToDelete.name}"?`
            : 'Deseja remover o exame selecionado?'
        }
        isOpen={isOpen}
        isSubmitting={isSaving}
        title="Confirmar exclusão"
        onCancel={closeConfirmation}
        onConfirm={() => void handleConfirmDeleteExam()}
      />
    </PageContainer>
  );
}
