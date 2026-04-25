'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCsvActions } from '@/hooks/useCsvActions';
import { useFeedback } from '@/hooks/useFeedback';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import {
  cancelAppointmentById,
  deleteAppointmentById,
  exportAppointmentsCsv,
  importAppointmentsCsv,
  listAppointments,
  updateAppointmentById,
} from '@/services/appointments.service';
import type { PaginatedResult, SortOrder } from '@/types/api';
import type {
  Appointment,
  AppointmentListSortBy,
  AppointmentStatus,
} from '@/types/appointment';
import { getRequestErrorMessage } from '@/utils/request';
import { toDateTimeLocalValue } from '@/utils/format';

const PAGE_SIZE = 8;

const createInitialPaginatedResult = (): PaginatedResult<Appointment> => ({
  data: [],
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
});

interface AppointmentEditFormState {
  scheduledAt: string;
  notes: string;
  status: AppointmentStatus;
}

const createAppointmentEditFormState = (
  appointment: Appointment,
): AppointmentEditFormState => ({
  scheduledAt: toDateTimeLocalValue(appointment.scheduledAt),
  notes: appointment.notes ?? '',
  status: appointment.status === 'CANCELLED' ? 'CANCELLED' : 'SCHEDULED',
});

export const useAppointmentsList = () => {
  const { canManageAppointments, canCancelAppointments } = useRolePermissions();
  const { publish } = useFeedback();

  const [result, setResult] = useState<PaginatedResult<Appointment>>(() =>
    createInitialPaginatedResult(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduledDateFilter, setScheduledDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<AppointmentListSortBy>('scheduledAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppointmentEditFormState | null>(null);

  const fetchAppointments = useCallback(
    async (
      page: number,
      nextSortOrder: SortOrder,
      nextSortBy: AppointmentListSortBy,
      scheduledDate?: string,
    ) => {
      setIsLoading(true);

      try {
        const listResult = await listAppointments({
          page,
          limit: PAGE_SIZE,
          sortOrder: nextSortOrder,
          sortBy: nextSortBy,
          scheduledDate: scheduledDate || undefined,
        });
        setResult(listResult);
      } catch (error) {
        publish('error', getRequestErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [publish],
  );

  useEffect(() => {
    void fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
  }, [fetchAppointments, result.page, scheduledDateFilter, sortBy, sortOrder]);

  const setPage = useCallback((nextPage: number) => {
    setResult((currentState) => ({
      ...currentState,
      page: nextPage,
    }));
  }, []);

  const updateScheduledDateFilter = useCallback((value: string) => {
    setScheduledDateFilter(value);
    setResult((currentState) => ({
      ...currentState,
      page: 1,
    }));
  }, []);

  const updateSortOrder = useCallback((nextSortOrder: SortOrder) => {
    setSortOrder(nextSortOrder);
    setResult((currentState) => ({
      ...currentState,
      page: 1,
    }));
  }, []);

  const updateSortBy = useCallback((nextSortBy: AppointmentListSortBy) => {
    setSortBy(nextSortBy);
    setResult((currentState) => ({
      ...currentState,
      page: 1,
    }));
  }, []);

  const startEdit = useCallback((appointment: Appointment) => {
    if (!canManageAppointments) {
      return;
    }

    if (appointment.status === 'PENDING') {
      publish('error', 'Aprovação pendente: use as ações de aprovar ou rejeitar.');
      return;
    }

    setEditingAppointmentId(appointment.id);
    setEditForm(createAppointmentEditFormState(appointment));
  }, [canManageAppointments, publish]);

  const cancelEdit = useCallback(() => {
    setEditingAppointmentId(null);
    setEditForm(null);
  }, []);

  const setEditField = useCallback(
    <TField extends keyof AppointmentEditFormState>(
      field: TField,
      value: AppointmentEditFormState[TField],
    ) => {
      setEditForm((currentState) => {
        if (!currentState) {
          return currentState;
        }

        return {
          ...currentState,
          [field]: value,
        };
      });
    },
    [],
  );

  const saveEdit = useCallback(async () => {
    if (!canManageAppointments) {
      return;
    }

    if (!editingAppointmentId || !editForm) {
      return;
    }

    const scheduledAtDate = new Date(editForm.scheduledAt);

    if (Number.isNaN(scheduledAtDate.getTime())) {
      publish('error', 'Informe uma data/hora válida para o agendamento.');
      return;
    }

    setIsSaving(true);
    try {
      await updateAppointmentById(editingAppointmentId, {
        scheduledAt: scheduledAtDate.toISOString(),
        notes: editForm.notes.trim() ? editForm.notes.trim() : null,
        status: editForm.status,
      });
      publish('success', 'Agendamento atualizado com sucesso.');
      cancelEdit();
      await fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canManageAppointments,
    cancelEdit,
    editForm,
    editingAppointmentId,
    fetchAppointments,
    publish,
    result.page,
    sortBy,
    sortOrder,
    scheduledDateFilter,
  ]);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    if (!canManageAppointments) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteAppointmentById(appointmentId);
      publish('success', 'Agendamento removido com sucesso.');

      const shouldGoToPreviousPage = result.data.length === 1 && result.page > 1;
      if (shouldGoToPreviousPage) {
        setPage(result.page - 1);
      } else {
        await fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
      }
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canManageAppointments,
    fetchAppointments,
    publish,
    result.data.length,
    result.page,
    sortBy,
    sortOrder,
    scheduledDateFilter,
    setPage,
  ]);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    if (!canCancelAppointments) {
      return;
    }

    setIsSaving(true);
    try {
      await cancelAppointmentById(appointmentId);
      publish('success', 'Agendamento cancelado com sucesso.');
      await fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canCancelAppointments,
    fetchAppointments,
    publish,
    result.page,
    scheduledDateFilter,
    sortBy,
    sortOrder,
  ]);

  const approveAppointment = useCallback(async (appointmentId: string) => {
    if (!canManageAppointments) {
      return;
    }

    setIsSaving(true);
    try {
      await updateAppointmentById(appointmentId, {
        status: 'SCHEDULED',
      });
      publish('success', 'Agendamento aprovado com sucesso.');
      await fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canManageAppointments,
    fetchAppointments,
    publish,
    result.page,
    scheduledDateFilter,
    sortBy,
    sortOrder,
  ]);

  const appointments = useMemo(() => result.data, [result.data]);
  const refreshCurrentPage = useCallback(async () => {
    await fetchAppointments(result.page, sortOrder, sortBy, scheduledDateFilter);
  }, [fetchAppointments, result.page, scheduledDateFilter, sortBy, sortOrder]);

  const {
    isImportingCsv,
    isExportingCsv,
    isCsvBusy,
    importCsvFile,
    exportCsvFile,
  } = useCsvActions({
    canManage: canManageAppointments,
    resourceLabel: 'agendamentos',
    importCsv: importAppointmentsCsv,
    exportCsv: exportAppointmentsCsv,
    reloadList: refreshCurrentPage,
  });

  return {
    appointments,
    page: result.page,
    total: result.total,
    totalPages: result.totalPages,
    scheduledDateFilter,
    sortBy,
    sortOrder,
    isLoading,
    isSaving,
    canManageAppointments,
    canCancelAppointments,
    editingAppointmentId,
    editForm,
    setPage,
    updateScheduledDateFilter,
    updateSortBy,
    updateSortOrder,
    startEdit,
    cancelEdit,
    setEditField,
    saveEdit,
    cancelAppointment,
    approveAppointment,
    deleteAppointment,
    isImportingCsv,
    isExportingCsv,
    isCsvBusy,
    importCsvFile,
    exportCsvFile,
  };
};
