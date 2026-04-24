'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import {
  deleteExamById,
  listExams,
  updateExamById,
  type UpdateExamPayload,
} from '@/services/exams.service';
import type { PaginatedResult, SortOrder } from '@/types/api';
import type { Exam } from '@/types/exam';
import { getRequestErrorMessage } from '@/utils/request';

const PAGE_SIZE = 8;

const createInitialPaginatedResult = (): PaginatedResult<Exam> => ({
  data: [],
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
});

interface ExamsEditFormState {
  name: string;
  description: string;
  durationMinutes: string;
  priceCents: string;
}

const createExamsEditFormState = (exam: Exam): ExamsEditFormState => ({
  name: exam.name,
  description: exam.description ?? '',
  durationMinutes: String(exam.durationMinutes),
  priceCents: String(exam.priceCents),
});

export const useExamsList = () => {
  const { canManageExams } = useRolePermissions();
  const { publish } = useFeedback();

  const [result, setResult] = useState<PaginatedResult<Exam>>(() => createInitialPaginatedResult());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExamsEditFormState | null>(null);

  const fetchExams = useCallback(async (page: number, nextSortOrder: SortOrder) => {
    setIsLoading(true);

    try {
      const listResult = await listExams({ page, limit: PAGE_SIZE, sortOrder: nextSortOrder });
      setResult(listResult);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [publish]);

  useEffect(() => {
    void fetchExams(result.page, sortOrder);
  }, [fetchExams, result.page, sortOrder]);

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

  const startEdit = useCallback((exam: Exam) => {
    if (!canManageExams) {
      return;
    }

    setEditingExamId(exam.id);
    setEditForm(createExamsEditFormState(exam));
  }, [canManageExams]);

  const cancelEdit = useCallback(() => {
    setEditingExamId(null);
    setEditForm(null);
  }, []);

  const setEditField = useCallback(
    (field: keyof ExamsEditFormState, value: string) => {
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
    if (!canManageExams) {
      return;
    }

    if (!editingExamId || !editForm) {
      return;
    }

    const durationMinutes = Number(editForm.durationMinutes);
    const priceCents = Number(editForm.priceCents);

    if (editForm.name.trim().length < 2) {
      publish('error', 'Informe o nome do exame com ao menos 2 caracteres.');
      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      publish('error', 'Informe uma duração válida em minutos.');
      return;
    }

    if (!Number.isInteger(priceCents) || priceCents <= 0) {
      publish('error', 'Informe um valor válido em centavos.');
      return;
    }

    const payload: UpdateExamPayload = {
      name: editForm.name.trim(),
      description: editForm.description.trim() ? editForm.description.trim() : null,
      durationMinutes,
      priceCents,
    };

    setIsSaving(true);
    try {
      await updateExamById(editingExamId, payload);
      publish('success', 'Exame atualizado com sucesso.');
      cancelEdit();
      await fetchExams(result.page, sortOrder);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [canManageExams, cancelEdit, editForm, editingExamId, fetchExams, publish, result.page, sortOrder]);

  const deleteExam = useCallback(async (examId: string) => {
    if (!canManageExams) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteExamById(examId);
      publish('success', 'Exame removido com sucesso.');

      const shouldGoToPreviousPage = result.data.length === 1 && result.page > 1;
      if (shouldGoToPreviousPage) {
        setPage(result.page - 1);
      } else {
        await fetchExams(result.page, sortOrder);
      }
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [canManageExams, fetchExams, publish, result.data.length, result.page, setPage, sortOrder]);

  const exams = useMemo(() => result.data, [result.data]);

  return {
    exams,
    page: result.page,
    total: result.total,
    totalPages: result.totalPages,
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
  };
};
