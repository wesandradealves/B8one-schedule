import { act, renderHook, waitFor } from '@testing-library/react';
import { useCreateExam } from '@/hooks/useCreateExam';
import { createExam } from '@/services/exams.service';

const pushMock = jest.fn();
const publishMock = jest.fn();
const useRolePermissionsMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => useRolePermissionsMock(),
}));

jest.mock('@/services/exams.service', () => ({
  createExam: jest.fn(),
}));

describe('useCreateExam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRolePermissionsMock.mockReturnValue({
      isAdmin: true,
      canManageExams: true,
      canManageAppointments: true,
      canCancelAppointments: true,
      canManageUsers: true,
    });

    (createExam as jest.Mock).mockResolvedValue({ id: 'exam-1' });
  });

  it('submits successfully with normalized payload', async () => {
    const { result } = renderHook(() => useCreateExam());

    act(() => {
      result.current.setField('name', '  Hemograma  ');
      result.current.setField('description', '  Exame laboratorial  ');
      result.current.setField('durationMinutes', '30');
      result.current.setField('priceCents', '15000');
      result.current.setField('availableStartTime', '08:00');
      result.current.setField('availableEndTime', '18:00');
      result.current.setField('availableFromDate', '2026-05-01');
      result.current.setField('availableToDate', '2026-12-31');
      result.current.toggleWeekday(0, true);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createExam).toHaveBeenCalledWith({
      name: 'Hemograma',
      description: 'Exame laboratorial',
      durationMinutes: 30,
      priceCents: 15000,
      availableWeekdays: [0, 1, 2, 3, 4, 5],
      availableStartTime: '08:00',
      availableEndTime: '18:00',
      availableFromDate: '2026-05-01',
      availableToDate: '2026-12-31',
    });
    expect(publishMock).toHaveBeenCalledWith('success', 'Exame criado com sucesso.');
    expect(pushMock).toHaveBeenCalledWith('/app/exams');
  });

  it('sends null description when field is empty', async () => {
    const { result } = renderHook(() => useCreateExam());

    act(() => {
      result.current.setField('name', 'Hemograma');
      result.current.setField('description', '   ');
      result.current.setField('durationMinutes', '20');
      result.current.setField('priceCents', '7900');
      result.current.setField('availableFromDate', '');
      result.current.setField('availableToDate', '');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createExam).toHaveBeenCalledWith({
      name: 'Hemograma',
      description: null,
      durationMinutes: 20,
      priceCents: 7900,
      availableWeekdays: [1, 2, 3, 4, 5],
      availableStartTime: '07:00',
      availableEndTime: '19:00',
      availableFromDate: null,
      availableToDate: null,
    });
  });

  it('validates exam form before submit', async () => {
    const { result } = renderHook(() => useCreateExam());

    act(() => {
      result.current.setField('name', 'A');
      result.current.setField('durationMinutes', '0');
      result.current.setField('priceCents', '-1');
      result.current.setField('availableStartTime', '19:00');
      result.current.setField('availableEndTime', '07:00');
      result.current.toggleWeekday(1, false);
      result.current.toggleWeekday(2, false);
      result.current.toggleWeekday(3, false);
      result.current.toggleWeekday(4, false);
      result.current.toggleWeekday(5, false);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createExam).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.name).toBe('Informe o nome do exame com ao menos 2 caracteres');
    expect(result.current.fieldErrors.durationMinutes).toBe('Informe uma duração válida em minutos');
    expect(result.current.fieldErrors.priceCents).toBe(
      'Informe um valor em centavos igual ou maior que zero',
    );
    expect(result.current.fieldErrors.availableWeekdays).toBe(
      'Selecione ao menos um dia disponível',
    );
    expect(result.current.fieldErrors.availableEndTime).toBe(
      'O horário final deve ser maior que o horário inicial',
    );
  });

  it('blocks submit for non-admin users', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canCancelAppointments: true,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useCreateExam());

    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.submit();
    });

    expect(createExam).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith('error', 'Acesso restrito ao perfil administrador.');
  });

  it('handles creation request errors', async () => {
    (createExam as jest.Mock).mockRejectedValue(new Error('Duration must be greater than zero'));

    const { result } = renderHook(() => useCreateExam());

    act(() => {
      result.current.setField('name', 'Exame XPTO');
      result.current.setField('durationMinutes', '10');
      result.current.setField('priceCents', '1000');
    });

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => {
      expect(result.current.message?.level).toBe('error');
    });
    expect(publishMock).toHaveBeenCalledWith('error', 'Duration must be greater than zero');
  });

  it('navigates back when cancel is called', () => {
    const { result } = renderHook(() => useCreateExam());

    act(() => {
      result.current.cancel();
    });

    expect(pushMock).toHaveBeenCalledWith('/app/exams');
  });
});
