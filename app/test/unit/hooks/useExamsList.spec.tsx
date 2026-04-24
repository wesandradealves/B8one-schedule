import { act, renderHook, waitFor } from '@testing-library/react';
import { useExamsList } from '@/hooks/useExamsList';
import { deleteExamById, listExams, updateExamById } from '@/services/exams.service';

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

    expect(listExams).toHaveBeenCalledWith({ page: 1, limit: 8, sortOrder: 'DESC' });
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
      result.current.setEditField('priceCents', '0');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateExamById).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Informe o nome do exame com ao menos 2 caracteres.',
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
      });
    });
  });
});
