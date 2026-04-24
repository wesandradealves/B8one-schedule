import { act, renderHook, waitFor } from '@testing-library/react';
import { useAppointmentsList } from '@/hooks/useAppointmentsList';
import {
  cancelAppointmentById,
  deleteAppointmentById,
  exportAppointmentsCsv,
  importAppointmentsCsv,
  listAppointments,
  updateAppointmentById,
} from '@/services/appointments.service';

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

jest.mock('@/services/appointments.service', () => ({
  cancelAppointmentById: jest.fn(),
  listAppointments: jest.fn(),
  updateAppointmentById: jest.fn(),
  deleteAppointmentById: jest.fn(),
  importAppointmentsCsv: jest.fn(),
  exportAppointmentsCsv: jest.fn(),
}));

jest.mock('@/utils/csv', () => ({
  isCsvFile: jest.fn(() => true),
  downloadCsvFile: jest.fn(),
}));

describe('useAppointmentsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRolePermissionsMock.mockReturnValue({
      isAdmin: true,
      canManageExams: true,
      canManageAppointments: true,
      canCancelAppointments: true,
      canManageUsers: true,
    });

    (listAppointments as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: 'Observações',
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      limit: 8,
      total: 1,
      totalPages: 1,
    });
  });

  it('should load appointments on mount and apply date filter query', async () => {
    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listAppointments).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      sortOrder: 'DESC',
      sortBy: 'scheduledAt',
      scheduledDate: undefined,
    });

    act(() => {
      result.current.updateScheduledDateFilter('2026-05-01');
    });

    await waitFor(() => {
      expect(listAppointments).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'DESC',
        sortBy: 'scheduledAt',
        scheduledDate: '2026-05-01',
      });
    });
  });

  it('should keep appointments order returned by API list (already sorted by backend)', async () => {
    (listAppointments as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'old',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Exame antigo',
          scheduledAt: '2026-05-01T08:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
        {
          id: 'new',
          userId: 'user-1',
          examId: 'exam-2',
          examName: 'Exame novo',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      limit: 8,
      total: 2,
      totalPages: 1,
    });

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.appointments[0].id).toBe('old');
    expect(result.current.appointments[1].id).toBe('new');
  });

  it('should block edit and delete actions when user cannot manage appointments', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canCancelAppointments: true,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.appointments[0]);
    });

    expect(result.current.editingAppointmentId).toBeNull();

    await act(async () => {
      await result.current.deleteAppointment('appt-1');
      await result.current.cancelAppointment('appt-1');
    });

    expect(deleteAppointmentById).not.toHaveBeenCalled();
    expect(cancelAppointmentById).toHaveBeenCalledWith('appt-1');
  });

  it('should validate schedule datetime before saving', async () => {
    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.appointments[0]);
      result.current.setEditField('scheduledAt', 'invalid');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateAppointmentById).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Informe uma data/hora válida para o agendamento.',
    );
  });

  it('should save appointment edits and reload current page', async () => {
    (updateAppointmentById as jest.Mock).mockResolvedValue({ id: 'appt-1' });
    const expectedIsoDate = new Date('2026-05-01T11:30').toISOString();

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.appointments[0]);
      result.current.setEditField('scheduledAt', '2026-05-01T11:30');
      result.current.setEditField('notes', 'Atualizado');
      result.current.setEditField('status', 'CANCELLED');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateAppointmentById).toHaveBeenCalledWith('appt-1', {
      scheduledAt: expectedIsoDate,
      notes: 'Atualizado',
      status: 'CANCELLED',
    });
    expect(publishMock).toHaveBeenCalledWith('success', 'Agendamento atualizado com sucesso.');
  });

  it('should delete and go to previous page when current page becomes empty', async () => {
    (listAppointments as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'appt-1',
            userId: 'user-1',
            examId: 'exam-1',
            examName: 'Hemograma',
            scheduledAt: '2026-05-01T10:00:00.000Z',
            notes: null,
            status: 'SCHEDULED',
            changeStatus: 'NONE',
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

    (deleteAppointmentById as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppointmentsList());

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
      await result.current.deleteAppointment('appt-1');
    });

    expect(deleteAppointmentById).toHaveBeenCalledWith('appt-1');
    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  it('should cancel appointment and reload current page', async () => {
    (cancelAppointmentById as jest.Mock).mockResolvedValue({
      id: 'appt-1',
      status: 'CANCELLED',
    });

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.cancelAppointment('appt-1');
    });

    expect(cancelAppointmentById).toHaveBeenCalledWith('appt-1');
    expect(publishMock).toHaveBeenCalledWith('success', 'Agendamento cancelado com sucesso.');
  });

  it('should update sort order and reload first page preserving filters', async () => {
    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateScheduledDateFilter('2026-05-01');
      result.current.updateSortOrder('ASC');
    });

    await waitFor(() => {
      expect(listAppointments).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'ASC',
        sortBy: 'scheduledAt',
        scheduledDate: '2026-05-01',
      });
    });
  });

  it('should update sortBy and reload first page preserving filters', async () => {
    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateScheduledDateFilter('2026-05-01');
      result.current.updateSortBy('status');
    });

    await waitFor(() => {
      expect(listAppointments).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'DESC',
        sortBy: 'status',
        scheduledDate: '2026-05-01',
      });
    });
  });

  it('should import appointments csv and refresh current list', async () => {
    (importAppointmentsCsv as jest.Mock).mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const csvFile = new File(
      ['userId,examId,scheduledAt\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z'],
      'appointments.csv',
      { type: 'text/csv' },
    );
    Object.defineProperty(csvFile, 'text', {
      value: jest.fn().mockResolvedValue(
        'userId,examId,scheduledAt\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z',
      ),
    });

    await act(async () => {
      await result.current.importCsvFile(csvFile);
    });

    expect(importAppointmentsCsv).toHaveBeenCalledTimes(1);
    expect(listAppointments).toHaveBeenCalledTimes(2);
  });

  it('should export appointments csv', async () => {
    (exportAppointmentsCsv as jest.Mock).mockResolvedValue({
      fileName: 'appointments.csv',
      csvContent: 'userId,examId,scheduledAt',
    });

    const { result } = renderHook(() => useAppointmentsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.exportCsvFile();
    });

    expect(exportAppointmentsCsv).toHaveBeenCalledTimes(1);
  });
});
