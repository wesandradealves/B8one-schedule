'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { deleteUserById, listUsers, updateUserById } from '@/services/users.service';
import type { PaginatedResult, SortOrder } from '@/types/api';
import type { User, UpdateUserPayload } from '@/types/user';
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
  profile: UserProfile;
  isActive: boolean;
}

const createUserEditFormState = (user: User): UserEditFormState => ({
  fullName: user.fullName,
  profile: user.profile,
  isActive: user.isActive,
});

export const useUsersList = () => {
  const { user: authenticatedUser } = useAuth();
  const { canManageUsers } = useRolePermissions();
  const { publish } = useFeedback();

  const [result, setResult] = useState<PaginatedResult<User>>(() => createInitialPaginatedResult());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserEditFormState | null>(null);

  const fetchUsers = useCallback(async (page: number, nextSortOrder: SortOrder) => {
    if (!canManageUsers) {
      setResult(createInitialPaginatedResult());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const listResult = await listUsers({ page, limit: PAGE_SIZE, sortOrder: nextSortOrder });
      setResult(listResult);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [canManageUsers, publish]);

  useEffect(() => {
    void fetchUsers(result.page, sortOrder);
  }, [fetchUsers, result.page, sortOrder]);

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

    const payload: UpdateUserPayload = {
      fullName: editForm.fullName.trim(),
      profile: editForm.profile,
      isActive: editForm.isActive,
    };

    setIsSaving(true);
    try {
      await updateUserById(editingUserId, payload);
      publish('success', 'Usuário atualizado com sucesso.');
      cancelEdit();
      await fetchUsers(result.page, sortOrder);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [canManageUsers, cancelEdit, editForm, editingUserId, fetchUsers, publish, result.page, sortOrder]);

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
        await fetchUsers(result.page, sortOrder);
      }
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [canManageUsers, fetchUsers, publish, result.data.length, result.page, setPage, sortOrder]);

  const users = useMemo(() => result.data, [result.data]);

  return {
    users,
    page: result.page,
    total: result.total,
    totalPages: result.totalPages,
    sortOrder,
    isLoading,
    isSaving,
    canManageUsers,
    editingUserId,
    editForm,
    authenticatedUserId: authenticatedUser?.id ?? null,
    setPage,
    updateSortOrder,
    startEdit,
    cancelEdit,
    setEditField,
    saveEdit,
    deleteUser,
  };
};
