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
import { useAppointmentsList } from '@/hooks/useAppointmentsList';
import type { SortOrder } from '@/types/api';
import type { Appointment, AppointmentStatus } from '@/types/appointment';
import { formatDateTime } from '@/utils/format';

const Controls = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const FilterWrapper = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const FilterLabel = styled.label.attrs({
  className: 'text-xs font-medium sm:text-sm',
})`
  color: var(--color-text-secondary);
`;

const StatusBadge = styled.span.attrs<{ $status: AppointmentStatus }>(({ $status }) => ({
  className:
    'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ' +
    ($status === 'SCHEDULED'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-200 text-slate-700'),
}))<{ $status: AppointmentStatus }>``;

const toStatusLabel = (status: string): string => {
  return status === 'CANCELLED' ? 'Cancelado' : 'Agendado';
};

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'DESC', label: 'Mais recentes' },
  { value: 'ASC', label: 'Mais antigos' },
];

export function AppointmentsListSection() {
  const {
    appointments,
    page,
    total,
    totalPages,
    scheduledDateFilter,
    sortOrder,
    isLoading,
    isSaving,
    canManageAppointments,
    canCancelAppointments,
    editingAppointmentId,
    editForm,
    setPage,
    updateScheduledDateFilter,
    updateSortOrder,
    startEdit,
    cancelEdit,
    setEditField,
    saveEdit,
    cancelAppointment,
    deleteAppointment,
  } = useAppointmentsList();
  const {
    isOpen,
    target: targetAppointmentToDelete,
    openConfirmation,
    closeConfirmation,
  } = useActionConfirmation<Appointment>();
  const {
    isOpen: isCancelDialogOpen,
    target: targetAppointmentToCancel,
    openConfirmation: openCancelConfirmation,
    closeConfirmation: closeCancelConfirmation,
  } = useActionConfirmation<Appointment>();

  const handleRequestDeleteAppointment = useCallback(
    (appointment: Appointment) => {
      openConfirmation(appointment);
    },
    [openConfirmation],
  );

  const handleConfirmDeleteAppointment = useCallback(async () => {
    if (!targetAppointmentToDelete) {
      return;
    }

    closeConfirmation();
    await deleteAppointment(targetAppointmentToDelete.id);
  }, [closeConfirmation, deleteAppointment, targetAppointmentToDelete]);

  const handleRequestCancelAppointment = useCallback((appointment: Appointment) => {
    if (appointment.status === 'CANCELLED') {
      return;
    }

    openCancelConfirmation(appointment);
  }, [openCancelConfirmation]);

  const handleConfirmCancelAppointment = useCallback(async () => {
    if (!targetAppointmentToCancel) {
      return;
    }

    closeCancelConfirmation();
    await cancelAppointment(targetAppointmentToCancel.id);
  }, [cancelAppointment, closeCancelConfirmation, targetAppointmentToCancel]);

  const headerRight = useMemo(() => {
    return (
      <FilterWrapper>
        <FilterLabel htmlFor="appointments-filter-date">Data</FilterLabel>
        <ListFormInput
          id="appointments-filter-date"
          type="date"
          value={scheduledDateFilter}
          onChange={(event) => updateScheduledDateFilter(event.target.value)}
        />
        <ListActionButton
          disabled={!scheduledDateFilter}
          variant="cancel"
          onClick={() => updateScheduledDateFilter('')}
        >
          Limpar
        </ListActionButton>
        <FilterLabel htmlFor="appointments-sort-order">Ordenar</FilterLabel>
        <ListFormSelect
          id="appointments-sort-order"
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
  }, [scheduledDateFilter, sortOrder, updateScheduledDateFilter, updateSortOrder]);

  const columns = useMemo<PaginatedListColumn<Appointment>[]>(() => {
    const baseColumns: PaginatedListColumn<Appointment>[] = [
      {
        key: 'scheduledAt',
        header: 'Data e hora',
        render: (appointment) => {
          if (editingAppointmentId === appointment.id && editForm) {
            return (
              <ListFormInput
                aria-label="Data e hora do agendamento"
                disabled={isSaving}
                type="datetime-local"
                value={editForm.scheduledAt}
                onChange={(event) => setEditField('scheduledAt', event.target.value)}
              />
            );
          }

          return formatDateTime(appointment.scheduledAt);
        },
      },
      {
        key: 'user',
        header: 'Usuário',
        render: (appointment) => {
          if (appointment.userFullName) {
            return appointment.userFullName;
          }

          if (appointment.userEmail) {
            return appointment.userEmail;
          }

          return '-';
        },
      },
      {
        key: 'exam',
        header: 'Exame',
        render: (appointment) => appointment.examName || '-',
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: (appointment) => {
          if (editingAppointmentId === appointment.id && editForm) {
            return (
              <ListFormSelect
                aria-label="Status do agendamento"
                disabled={isSaving}
                value={editForm.status}
                onChange={(event) =>
                  setEditField(
                    'status',
                    event.target.value as AppointmentStatus,
                  )
                }
              >
                <option value="SCHEDULED">Agendado</option>
                <option value="CANCELLED">Cancelado</option>
              </ListFormSelect>
            );
          }

          const status = appointment.status === 'CANCELLED' ? 'CANCELLED' : 'SCHEDULED';
          return <StatusBadge $status={status}>{toStatusLabel(appointment.status)}</StatusBadge>;
        },
      },
      {
        key: 'notes',
        header: 'Observações',
        render: (appointment) => {
          if (editingAppointmentId === appointment.id && editForm) {
            return (
              <ListFormInput
                aria-label="Observações do agendamento"
                disabled={isSaving}
                value={editForm.notes}
                onChange={(event) => setEditField('notes', event.target.value)}
              />
            );
          }

          return appointment.notes || '-';
        },
      },
    ];

    if (!canManageAppointments && !canCancelAppointments) {
      return baseColumns;
    }

    const actionColumn: PaginatedListColumn<Appointment> = {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (appointment) => {
        if (editingAppointmentId === appointment.id) {
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
            {canManageAppointments ? (
              <ListActionButton
                disabled={isSaving}
                variant="edit"
                onClick={() => startEdit(appointment)}
              >
                Editar
              </ListActionButton>
            ) : null}
            <ListActionButton
              disabled={isSaving || appointment.status === 'CANCELLED'}
              variant="cancel"
              onClick={() => handleRequestCancelAppointment(appointment)}
            >
              Cancelar
            </ListActionButton>
            {canManageAppointments ? (
              <ListActionButton
                disabled={isSaving}
                variant="delete"
                onClick={() => handleRequestDeleteAppointment(appointment)}
              >
                Excluir
              </ListActionButton>
            ) : null}
          </Controls>
        );
      },
    };

    return [...baseColumns, actionColumn];
  }, [
    canCancelAppointments,
    canManageAppointments,
    cancelEdit,
    editForm,
    editingAppointmentId,
    handleRequestCancelAppointment,
    handleRequestDeleteAppointment,
    isSaving,
    saveEdit,
    setEditField,
    startEdit,
  ]);

  return (
    <PageContainer>
      <PageTitle>Agendamentos</PageTitle>
      <PageDescription>
        Listagem padronizada com filtro por data e paginação de 8 itens.
      </PageDescription>

      <PaginatedListTable
        columns={columns}
        emptyMessage="Nenhum agendamento encontrado para os filtros atuais."
        getRowKey={(appointment) => appointment.id}
        headerRight={headerRight}
        isLoading={isLoading}
        page={page}
        rows={appointments}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ActionConfirmDialog
        confirmLabel="Excluir"
        description={
          targetAppointmentToDelete
            ? `Deseja remover o agendamento de ${formatDateTime(targetAppointmentToDelete.scheduledAt)}?`
            : 'Deseja remover o agendamento selecionado?'
        }
        isOpen={isOpen}
        isSubmitting={isSaving}
        title="Confirmar exclusão"
        onCancel={closeConfirmation}
        onConfirm={() => void handleConfirmDeleteAppointment()}
      />
      <ActionConfirmDialog
        confirmLabel="Confirmar"
        confirmVariant="save"
        description={
          targetAppointmentToCancel
            ? `Deseja cancelar o agendamento de ${formatDateTime(targetAppointmentToCancel.scheduledAt)}?`
            : 'Deseja cancelar o agendamento selecionado?'
        }
        isOpen={isCancelDialogOpen}
        isSubmitting={isSaving}
        title="Confirmar cancelamento"
        onCancel={closeCancelConfirmation}
        onConfirm={() => void handleConfirmCancelAppointment()}
      />
    </PageContainer>
  );
}
