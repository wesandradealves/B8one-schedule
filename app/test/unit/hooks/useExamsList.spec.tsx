import { act, renderHook, waitFor } from '@testing-library/react';
import { useExamsList } from '@/hooks/useExamsList';
import {
  deleteExamById,
  exportExamsCsv,
  importExamsCsv,
  listExams,
  updateExamById,
} from '@/services/exams.service';

const useRolePermissionsMock = jest.fn();
const publishMock = jest.fn();

jest.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => useRolePermissionsMock(),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/services/exams.service', () => ({
  listExams: jest.fn(),
  updateExamById: jest.fn(),
  deleteExamById: jest.fn(),
  importExamsCsv: jest.fn(),
  exportExamsCsv: jest.fn(),
}));

jest.mock('@/utils/csv', () => ({
  isCsvFile: jest.fn(() => true),
  downloadCsvFile: jest.fn(),
}));

describe('useExamsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRolePermissionsMock.mockReturnValue({
      isAdmin: true,
      canManageExams: true,
      canManageAppointments: true,
      canManageUsers: true,
    });

    (listExams as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 12000,
        },
      ],
      page: 1,
      limit: 8,
      total: 1,
      totalPages: 1,
    });
  });

  it('should load paginated exams on mount', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listExams).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      sortOrder: 'DESC',
      sortBy: 'createdAt',
    });
    expect(result.current.exams).toHaveLength(1);
    expect(result.current.exams[0].id).toBe('exam-1');
  });

  it('should block edit actions when user cannot manage exams', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.exams[0]);
    });

    expect(result.current.editingExamId).toBeNull();

    await act(async () => {
      await result.current.deleteExam('exam-1');
    });

    expect(deleteExamById).not.toHaveBeenCalled();
  });

  it('should validate form before saving edits', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.exams[0]);
      result.current.setEditField('name', 'A');
      result.current.setEditField('durationMinutes', '0');
      result.current.setEditField('priceCents', '-1');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateExamById).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Informe o nome do exame com ao menos 2 caracteres.',
    );

    act(() => {
      result.current.setEditField('name', 'Hemograma');
      result.current.setEditField('durationMinutes', '30');
      result.current.setEditField('priceCents', '-1');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Informe um valor em centavos igual ou maior que zero.',
    );
  });

  it('should save and reload current page after successful update', async () => {
    (updateExamById as jest.Mock).mockResolvedValue({
      id: 'exam-1',
      name: 'Hemograma atualizado',
      description: 'Exame laboratorial',
      durationMinutes: 35,
      priceCents: 14000,
    });

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.exams[0]);
      result.current.setEditField('name', 'Hemograma atualizado');
      result.current.setEditField('durationMinutes', '35');
      result.current.setEditField('priceCents', '14000');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateExamById).toHaveBeenCalledWith('exam-1', {
      name: 'Hemograma atualizado',
      description: 'Exame laboratorial',
      durationMinutes: 35,
      priceCents: 14000,
    });
    expect(publishMock).toHaveBeenCalledWith('success', 'Exame atualizado com sucesso.');
    expect(listExams).toHaveBeenCalledTimes(2);
  });

  it('should delete and change to previous page when current page becomes empty', async () => {
    (listExams as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'exam-1',
            name: 'Hemograma',
            description: null,
            durationMinutes: 30,
            priceCents: 12000,
          },
        ],
        page: 2,
        limit: 8,
        total: 9,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [],
        page: 1,
        limit: 8,
        total: 8,
        totalPages: 1,
      });

    (deleteExamById as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });

    await act(async () => {
      await result.current.deleteExam('exam-1');
    });

    expect(deleteExamById).toHaveBeenCalledWith('exam-1');
    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  it('should update sort order and reload first page', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateSortOrder('ASC');
    });

    await waitFor(() => {
      expect(listExams).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'ASC',
        sortBy: 'createdAt',
      });
    });
  });

  it('should update sortBy and reload first page', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateSortBy('priceCents');
    });

    await waitFor(() => {
      expect(listExams).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'DESC',
        sortBy: 'priceCents',
      });
    });
  });

  it('should import exams csv and refresh current list', async () => {
    (importExamsCsv as jest.Mock).mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const csvFile = new File(
      ['name,durationMinutes,priceCents,isActive\nExam,30,1000,true'],
      'exams.csv',
      { type: 'text/csv' },
    );
    Object.defineProperty(csvFile, 'text', {
      value: jest.fn().mockResolvedValue(
        'name,durationMinutes,priceCents,isActive\nExam,30,1000,true',
      ),
    });

    await act(async () => {
      await result.current.importCsvFile(csvFile);
    });

    expect(importExamsCsv).toHaveBeenCalledTimes(1);
    expect(listExams).toHaveBeenCalledTimes(2);
  });

  it('should export exams csv', async () => {
    (exportExamsCsv as jest.Mock).mockResolvedValue({
      fileName: 'exams.csv',
      csvContent: 'name,durationMinutes,priceCents,isActive',
    });

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.exportCsvFile();
    });

    expect(exportExamsCsv).toHaveBeenCalledTimes(1);
  });

  it('should publish error when list exams fails', async () => {
    (listExams as jest.Mock).mockRejectedValueOnce(new Error('exams list failure'));

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'exams list failure');
  });

  it('should ignore edit field updates when no edit is active', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setEditField('name', 'Sem edição');
    });

    expect(result.current.editForm).toBeNull();
  });

  it('should no-op save and delete when user cannot manage exams', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveEdit();
      await result.current.deleteExam('exam-1');
    });

    expect(updateExamById).not.toHaveBeenCalled();
    expect(deleteExamById).not.toHaveBeenCalled();
  });

  it('should no-op save when there is no active edit', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateExamById).not.toHaveBeenCalled();
  });

  it('should validate invalid duration before saving', async () => {
    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.exams[0]);
      result.current.setEditField('durationMinutes', '0');
      result.current.setEditField('name', 'Hemograma');
      result.current.setEditField('priceCents', '1000');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'Informe uma duração válida em minutos.');
  });

  it('should publish error when save exam fails', async () => {
    (updateExamById as jest.Mock).mockRejectedValueOnce(new Error('save exam failure'));

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.exams[0]);
      result.current.setEditField('name', 'Hemograma');
      result.current.setEditField('durationMinutes', '30');
      result.current.setEditField('priceCents', '1000');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'save exam failure');
  });

  it('should reload current page after delete when still on same page', async () => {
    (deleteExamById as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteExam('exam-1');
    });

    expect(deleteExamById).toHaveBeenCalledWith('exam-1');
    expect(listExams).toHaveBeenCalledTimes(2);
  });

  it('should publish error when delete exam fails', async () => {
    (deleteExamById as jest.Mock).mockRejectedValueOnce(new Error('delete exam failure'));

    const { result } = renderHook(() => useExamsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteExam('exam-1');
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'delete exam failure');
  });
});
