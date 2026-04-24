'use client';

import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ListActionButton } from '@/components/atoms/list-action-button';
import { ListFormInput, ListFormSelect } from '@/components/atoms/list-form-controls';
import { ActionConfirmDialog } from '@/components/molecules/action-confirm-dialog';
import { ListCsvControls } from '@/components/molecules/list-csv-controls';
import {
  PaginatedListTable,
  type PaginatedListColumn,
} from '@/components/organisms/protected/paginated-list-table';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { useActionConfirmation } from '@/hooks/useActionConfirmation';
import { useUsersList } from '@/hooks/useUsersList';
import type { SortOrder } from '@/types/api';
import type { User, UserListSortBy } from '@/types/user';

const Controls = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const RestrictedCard = styled.section.attrs({
  className: 'mt-6 rounded-2xl border bg-white px-4 py-8 text-center text-sm',
})`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
`;

const StatusBadge = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
  className:
    'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ' +
    ($active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'),
}))<{ $active: boolean }>``;

const profileOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'CLIENT', label: 'Cliente' },
] as const;

const FilterWrapper = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const HeaderRightContent = styled.div.attrs({
  className: 'flex flex-wrap items-center justify-end gap-2',
})``;

const FilterLabel = styled.label.attrs({
  className: 'text-xs font-medium sm:text-sm',
})`
  color: var(--color-text-secondary);
`;

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'DESC', label: 'Decrescente' },
  { value: 'ASC', label: 'Crescente' },
];

const sortByOptions: Array<{ value: UserListSortBy; label: string }> = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'profile', label: 'Perfil' },
  { value: 'isActive', label: 'Status' },
];

const toProfileLabel = (profile: 'ADMIN' | 'CLIENT'): string => {
  return profile === 'ADMIN' ? 'Administrador' : 'Cliente';
};

export function UsersListSection() {
  const {
    users,
    page,
    total,
    totalPages,
    sortBy,
    sortOrder,
    isLoading,
    isSaving,
    canManageUsers,
    editingUserId,
    editForm,
    authenticatedUserId,
    setPage,
    updateSortBy,
    updateSortOrder,
    startEdit,
    cancelEdit,
    setEditField,
    saveEdit,
    deleteUser,
    isImportingCsv,
    isExportingCsv,
    isCsvBusy,
    importCsvFile,
    exportCsvFile,
  } = useUsersList();
  const {
    isOpen,
    target: targetUserToDelete,
    openConfirmation,
    closeConfirmation,
  } = useActionConfirmation<User>();

  const handleRequestDeleteUser = useCallback(
    (user: User) => {
      if (user.id === authenticatedUserId) {
        return;
      }

      openConfirmation(user);
    },
    [authenticatedUserId, openConfirmation],
  );

  const handleConfirmDeleteUser = useCallback(async () => {
    if (!targetUserToDelete) {
      return;
    }

    closeConfirmation();
    await deleteUser(targetUserToDelete.id);
  }, [closeConfirmation, deleteUser, targetUserToDelete]);

  const columns = useMemo<PaginatedListColumn<User>[]>(() => {
    const baseColumns: PaginatedListColumn<User>[] = [
      {
        key: 'fullName',
        header: 'Nome',
        render: (user) => {
          if (editingUserId === user.id && editForm) {
            return (
              <ListFormInput
                aria-label="Nome do usuário"
                disabled={isSaving}
                value={editForm.fullName}
                onChange={(event) => setEditField('fullName', event.target.value)}
              />
            );
          }

          return <span className="font-semibold">{user.fullName}</span>;
        },
      },
      {
        key: 'email',
        header: 'E-mail',
        render: (user) => {
          if (editingUserId === user.id && editForm) {
            return (
              <ListFormInput
                aria-label="E-mail do usuário"
                disabled={isSaving}
                type="email"
                value={editForm.email}
                onChange={(event) => setEditField('email', event.target.value)}
              />
            );
          }

          return user.email;
        },
      },
      {
        key: 'profile',
        header: 'Perfil',
        align: 'center',
        render: (user) => {
          if (editingUserId === user.id && editForm) {
            return (
              <ListFormSelect
                aria-label="Perfil do usuário"
                disabled={isSaving}
                value={editForm.profile}
                onChange={(event) => setEditField('profile', event.target.value as 'ADMIN' | 'CLIENT')}
              >
                {profileOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ListFormSelect>
            );
          }

          return toProfileLabel(user.profile);
        },
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: (user) => {
          if (editingUserId === user.id && editForm) {
            return (
              <ListFormSelect
                aria-label="Status do usuário"
                disabled={isSaving}
                value={String(editForm.isActive)}
                onChange={(event) => setEditField('isActive', event.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </ListFormSelect>
            );
          }

          return <StatusBadge $active={user.isActive}>{user.isActive ? 'Ativo' : 'Inativo'}</StatusBadge>;
        },
      },
    ];

    if (!canManageUsers) {
      return baseColumns;
    }

    const actionColumn: PaginatedListColumn<User> = {
      key: 'actions',
      header: 'Ações',
      align: 'center',
      render: (user) => {
        if (editingUserId === user.id) {
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

        const isCurrentUser = user.id === authenticatedUserId;

        return (
          <Controls>
            <ListActionButton disabled={isSaving} variant="edit" onClick={() => startEdit(user)}>
              Editar
            </ListActionButton>
            <ListActionButton
              disabled={isSaving || isCurrentUser}
              title={isCurrentUser ? 'Não é possível desativar o próprio usuário logado' : undefined}
              variant="delete"
              onClick={() => handleRequestDeleteUser(user)}
            >
              Excluir
            </ListActionButton>
          </Controls>
        );
      },
    };

    return [...baseColumns, actionColumn];
  }, [
    authenticatedUserId,
    canManageUsers,
    cancelEdit,
    editForm,
    editingUserId,
    handleRequestDeleteUser,
    isSaving,
    saveEdit,
    setEditField,
    startEdit,
  ]);

  const headerRight = useMemo(() => {
    return (
      <HeaderRightContent>
        <FilterWrapper>
          <FilterLabel htmlFor="users-sort-by">Filtrar</FilterLabel>
          <ListFormSelect
            id="users-sort-by"
            value={sortBy}
            onChange={(event) => updateSortBy(event.target.value as UserListSortBy)}
          >
            {sortByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </ListFormSelect>
          <ListFormSelect
            aria-label="Ordem dos resultados"
            id="users-sort-order"
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
        <ListCsvControls
          isDisabled={isCsvBusy || isSaving}
          isExporting={isExportingCsv}
          isImporting={isImportingCsv}
          resourceLabel="usuários"
          onExportCsv={exportCsvFile}
          onImportCsv={importCsvFile}
        />
      </HeaderRightContent>
    );
  }, [
    exportCsvFile,
    importCsvFile,
    isCsvBusy,
    isExportingCsv,
    isImportingCsv,
    isSaving,
    sortBy,
    sortOrder,
    updateSortBy,
    updateSortOrder,
  ]);

  if (!canManageUsers) {
    return (
      <PageContainer>
        <PageTitle>Usuários</PageTitle>
        <PageDescription>
          Área restrita para administração de usuários.
        </PageDescription>

        <RestrictedCard>Acesso restrito ao perfil administrador.</RestrictedCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Usuários</PageTitle>
      <PageDescription>
        Listagem administrativa com paginação de 8 itens por página.
      </PageDescription>

      <PaginatedListTable
        columns={columns}
        emptyMessage="Nenhum usuário encontrado para os filtros atuais."
        getRowKey={(user) => user.id}
        headerRight={headerRight}
        isLoading={isLoading}
        page={page}
        rows={users}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ActionConfirmDialog
        confirmLabel="Desativar"
        description={
          targetUserToDelete
            ? `Deseja desativar o usuário "${targetUserToDelete.fullName}"?`
            : 'Deseja desativar o usuário selecionado?'
        }
        isOpen={isOpen}
        isSubmitting={isSaving}
        title="Confirmar desativação"
        onCancel={closeConfirmation}
        onConfirm={() => void handleConfirmDeleteUser()}
      />
    </PageContainer>
  );
}
