'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { useCsvActions } from '@/hooks/useCsvActions';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import {
  deleteUserById,
  exportUsersCsv,
  importUsersCsv,
  listUsers,
  updateUserById,
} from '@/services/users.service';
import type { PaginatedResult, SortOrder } from '@/types/api';
import type { User, UpdateUserPayload, UserListSortBy } from '@/types/user';
import type { UserProfile } from '@/types/auth';
import { getRequestErrorMessage } from '@/utils/request';

const PAGE_SIZE = 8;

const createInitialPaginatedResult = (): PaginatedResult<User> => ({
  data: [],
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
});

interface UserEditFormState {
  fullName: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
}

const createUserEditFormState = (user: User): UserEditFormState => ({
  fullName: user.fullName,
  email: user.email,
  profile: user.profile,
  isActive: user.isActive,
});

export const useUsersList = () => {
  const { user: authenticatedUser } = useAuth();
  const { canManageUsers } = useRolePermissions();
  const { publish } = useFeedback();
  const logout = useLogout();

  const [result, setResult] = useState<PaginatedResult<User>>(() => createInitialPaginatedResult());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [sortBy, setSortBy] = useState<UserListSortBy>('createdAt');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserEditFormState | null>(null);

  const fetchUsers = useCallback(
    async (
      page: number,
      nextSortOrder: SortOrder,
      nextSortBy: UserListSortBy,
    ) => {
      if (!canManageUsers) {
        setResult(createInitialPaginatedResult());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const listResult = await listUsers({
          page,
          limit: PAGE_SIZE,
          sortOrder: nextSortOrder,
          sortBy: nextSortBy,
        });
        setResult(listResult);
      } catch (error) {
        publish('error', getRequestErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [canManageUsers, publish],
  );

  useEffect(() => {
    void fetchUsers(result.page, sortOrder, sortBy);
  }, [fetchUsers, result.page, sortBy, sortOrder]);

  const setPage = useCallback((nextPage: number) => {
    setResult((currentState) => ({
      ...currentState,
      page: nextPage,
    }));
  }, []);

  const updateSortOrder = useCallback((nextSortOrder: SortOrder) => {
    setSortOrder(nextSortOrder);
    setResult((currentState) => ({
      ...currentState,
      page: 1,
    }));
  }, []);

  const updateSortBy = useCallback((nextSortBy: UserListSortBy) => {
    setSortBy(nextSortBy);
    setResult((currentState) => ({
      ...currentState,
      page: 1,
    }));
  }, []);

  const startEdit = useCallback((targetUser: User) => {
    if (!canManageUsers) {
      return;
    }

    setEditingUserId(targetUser.id);
    setEditForm(createUserEditFormState(targetUser));
  }, [canManageUsers]);

  const cancelEdit = useCallback(() => {
    setEditingUserId(null);
    setEditForm(null);
  }, []);

  const setEditField = useCallback(
    <TField extends keyof UserEditFormState>(field: TField, value: UserEditFormState[TField]) => {
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
    if (!canManageUsers) {
      return;
    }

    if (!editingUserId || !editForm) {
      return;
    }

    if (editForm.fullName.trim().length < 3) {
      publish('error', 'Informe o nome com ao menos 3 caracteres.');
      return;
    }

    const normalizedEmail = editForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      publish('error', 'Informe um e-mail válido.');
      return;
    }

    const payload: UpdateUserPayload = {
      fullName: editForm.fullName.trim(),
      email: normalizedEmail,
      profile: editForm.profile,
      isActive: editForm.isActive,
    };

    setIsSaving(true);
    try {
      await updateUserById(editingUserId, payload);
      publish('success', 'Usuário atualizado com sucesso.');
      cancelEdit();
      const updatedOwnSession =
        editingUserId === authenticatedUser?.id &&
        (
          payload.profile !== authenticatedUser.profile ||
          payload.email !== authenticatedUser.email ||
          payload.isActive === false
        );

      if (updatedOwnSession) {
        logout();
        return;
      }

      await fetchUsers(result.page, sortOrder, sortBy);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canManageUsers,
    cancelEdit,
    editForm,
    editingUserId,
    fetchUsers,
    authenticatedUser,
    logout,
    publish,
    result.page,
    sortBy,
    sortOrder,
  ]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!canManageUsers) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteUserById(userId);
      publish('success', 'Usuário removido com sucesso.');

      const shouldGoToPreviousPage = result.data.length === 1 && result.page > 1;
      if (shouldGoToPreviousPage) {
        setPage(result.page - 1);
      } else {
        await fetchUsers(result.page, sortOrder, sortBy);
      }
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [
    canManageUsers,
    fetchUsers,
    publish,
    result.data.length,
    result.page,
    setPage,
    sortBy,
    sortOrder,
  ]);

  const users = useMemo(() => result.data, [result.data]);
  const refreshCurrentPage = useCallback(async () => {
    await fetchUsers(result.page, sortOrder, sortBy);
  }, [fetchUsers, result.page, sortBy, sortOrder]);

  const {
    isImportingCsv,
    isExportingCsv,
    isCsvBusy,
    importCsvFile,
    exportCsvFile,
  } = useCsvActions({
    canManage: canManageUsers,
    resourceLabel: 'usuários',
    importCsv: importUsersCsv,
    exportCsv: exportUsersCsv,
    reloadList: refreshCurrentPage,
  });

  return {
    users,
    page: result.page,
    total: result.total,
    totalPages: result.totalPages,
    sortBy,
    sortOrder,
    isLoading,
    isSaving,
    canManageUsers,
    editingUserId,
    editForm,
    authenticatedUserId: authenticatedUser?.id ?? null,
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
  };
};
