import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { Views } from 'react-big-calendar';
import { useExamSchedulingCalendar } from '@/hooks/useExamSchedulingCalendar';
import {
  createAppointment,
  listAppointmentAvailability,
} from '@/services/appointments.service';
import { getExamById } from '@/services/exams.service';

const publishMock = jest.fn();
const pushMock = jest.fn();

jest.mock('@/services/exams.service', () => ({
  getExamById: jest.fn(),
}));

jest.mock('@/services/appointments.service', () => ({
  createAppointment: jest.fn(),
  listAppointmentAvailability: jest.fn(),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const makeDate = (daysFromNow: number, hours: number, minutes = 0): Date => {
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const baseExam = {
  id: 'exam-1',
  name: 'Hemograma Completo',
  description: 'Descrição',
  durationMinutes: 20,
  priceCents: 4500,
};

describe('useExamSchedulingCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getExamById as jest.Mock).mockResolvedValue(baseExam);
    (listAppointmentAvailability as jest.Mock).mockResolvedValue([]);
    (createAppointment as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'PENDING',
    });
  });

  const renderSchedulingHook = () => {
    return renderHook(() => useExamSchedulingCalendar({ examId: 'exam-1' }));
  };

  const waitForInitialLoad = async (
    result: ReturnType<typeof renderSchedulingHook>['result'],
  ) => {
    await waitFor(() => {
      expect(result.current.isLoadingExam).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });
  };

  it('loads exam and availability events', async () => {
    const busySlot = makeDate(2, 9);

    (listAppointmentAvailability as jest.Mock).mockResolvedValue([
      {
        id: 'busy-1',
        examId: 'exam-1',
        scheduledAt: busySlot.toISOString(),
        status: 'PENDING',
      },
      {
        id: 'invalid-1',
        examId: 'exam-1',
        scheduledAt: 'invalid-date',
        status: 'SCHEDULED',
      },
    ]);

    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    expect(getExamById).toHaveBeenCalledWith('exam-1');
    expect(listAppointmentAvailability).toHaveBeenCalledWith(
      expect.objectContaining({
        examId: 'exam-1',
        startsAt: expect.any(String),
        endsAt: expect.any(String),
      }),
    );
    expect(result.current.slotStep).toBe(20);
    expect(result.current.availabilityEvents).toEqual([
      expect.objectContaining({
        id: 'busy-1',
        status: 'PENDING',
        title: 'Pendente',
      }),
    ]);
  });

  it('falls back to default slot step when exam duration is invalid', async () => {
    (getExamById as jest.Mock).mockResolvedValue({
      ...baseExam,
      durationMinutes: 0,
    });

    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    expect(result.current.slotStep).toBe(30);
  });

  it('handles exam and availability loading errors', async () => {
    (getExamById as jest.Mock).mockRejectedValueOnce(new Error('Falha ao carregar exame'));

    const first = renderSchedulingHook();

    await waitFor(() => {
      expect(first.result.current.isLoadingExam).toBe(false);
    });

    expect(first.result.current.exam).toBeNull();
    expect(first.result.current.isLoadingAvailability).toBe(false);
    expect(publishMock).toHaveBeenCalledWith('error', 'Falha ao carregar exame');

    (listAppointmentAvailability as jest.Mock).mockRejectedValueOnce(
      new Error('Falha ao carregar disponibilidade'),
    );

    const second = renderSchedulingHook();
    await waitForInitialLoad(second.result);

    expect(publishMock).toHaveBeenCalledWith('error', 'Falha ao carregar disponibilidade');
    expect(second.result.current.availabilityEvents).toEqual([]);
  });

  it('validates slot ranges while selecting', async () => {
    const busySlot = makeDate(3, 10);

    (listAppointmentAvailability as jest.Mock).mockResolvedValue([
      {
        id: 'busy-1',
        examId: 'exam-1',
        scheduledAt: busySlot.toISOString(),
        status: 'SCHEDULED',
      },
    ]);

    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    expect(
      result.current.handleSelecting({
        start: new Date('invalid'),
        end: busySlot,
      }),
    ).toBe(false);

    expect(
      result.current.handleSelecting({
        start: busySlot,
        end: new Date(busySlot.getTime() + 20 * 60_000),
      }),
    ).toBe(false);

    const freeSlot = makeDate(4, 11);

    expect(
      result.current.handleSelecting({
        start: freeSlot,
        end: new Date(freeSlot.getTime() + 20 * 60_000),
      }),
    ).toBe(true);

    act(() => {
      result.current.handleView(Views.MONTH);
    });

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });

    expect(
      result.current.handleSelecting({
        start: busySlot,
        end: new Date(busySlot.getTime() + 20 * 60_000),
      }),
    ).toBe(true);
  });

  it('selects or rejects slots according to validation', async () => {
    const busySlot = makeDate(5, 10);

    (listAppointmentAvailability as jest.Mock).mockResolvedValue([
      {
        id: 'busy-1',
        examId: 'exam-1',
        scheduledAt: busySlot.toISOString(),
        status: 'PENDING',
      },
    ]);

    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    act(() => {
      result.current.handleSelectSlot({ start: new Date('invalid') } as never);
    });

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Não foi possível identificar o horário selecionado.',
    );

    act(() => {
      result.current.handleSelectSlot({ start: busySlot } as never);
    });

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Este horário já está ocupado para o exame selecionado.',
    );

    const freeSlot = makeDate(6, 9);

    act(() => {
      result.current.handleSelectSlot({ start: freeSlot } as never);
    });

    expect(result.current.selectedSlotStart?.toISOString()).toBe(freeSlot.toISOString());
  });

  it('supports month day selection and empty-day feedback', async () => {
    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    act(() => {
      result.current.handleView(Views.MONTH);
      result.current.handleNavigate(makeDate(20, 9));
    });

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });

    const availableDay = makeDate(21, 0);
    availableDay.setHours(0, 0, 0, 0);

    act(() => {
      result.current.handleSelectSlot({ start: availableDay } as never);
    });

    expect(result.current.selectedSlotStart).not.toBeNull();
    expect(result.current.selectedSlotStart?.getHours()).toBe(7);

    const headerNode = result.current.calendarComponents.month.dateHeader({
      date: availableDay,
      label: '16',
    } as never);

    render(<>{headerNode}</>);

    fireEvent.click(screen.getByRole('button', { name: '16' }));

    expect(result.current.selectedSlotStart?.getHours()).toBe(7);

    act(() => {
      result.current.handleSelectSlot({ start: new Date('2000-01-01T00:00:00.000Z') } as never);
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'Não há horários disponíveis neste dia.');
  });

  it('confirms scheduling and handles request errors', async () => {
    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    await act(async () => {
      await result.current.handleConfirmSchedule();
    });

    expect(createAppointment).not.toHaveBeenCalled();

    act(() => {
      result.current.setSelectedSlotStart(makeDate(-1, 10));
    });

    await act(async () => {
      await result.current.handleConfirmSchedule();
    });

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Escolha um horário futuro para solicitar o agendamento.',
    );
    expect(result.current.selectedSlotStart).toBeNull();

    const validSlot = makeDate(7, 11);

    act(() => {
      result.current.setSelectedSlotStart(validSlot);
    });

    (createAppointment as jest.Mock).mockResolvedValueOnce({
      id: 'appointment-2',
      status: 'PENDING',
    });

    await act(async () => {
      await result.current.handleConfirmSchedule();
    });

    expect(createAppointment).toHaveBeenCalledWith({
      examId: 'exam-1',
      scheduledAt: validSlot.toISOString(),
    });
    expect(publishMock).toHaveBeenCalledWith(
      'success',
      'Solicitação enviada e aguardando aprovação do administrador.',
    );
    expect(pushMock).toHaveBeenCalledWith('/app/appointments');

    act(() => {
      result.current.setSelectedSlotStart(makeDate(8, 11));
    });

    (createAppointment as jest.Mock).mockResolvedValueOnce({
      id: 'appointment-3',
      status: 'SCHEDULED',
    });

    await act(async () => {
      await result.current.handleConfirmSchedule();
    });

    expect(publishMock).toHaveBeenCalledWith('success', 'Agendamento criado com sucesso.');

    act(() => {
      result.current.setSelectedSlotStart(makeDate(9, 11));
    });

    (createAppointment as jest.Mock).mockRejectedValueOnce(new Error('Falha ao agendar'));

    await act(async () => {
      await result.current.handleConfirmSchedule();
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'Falha ao agendar');
  });

  it('returns visual props for events, slots and days', async () => {
    const busySlot = makeDate(3, 7);

    (getExamById as jest.Mock).mockResolvedValue({
      ...baseExam,
      durationMinutes: 720,
    });
    (listAppointmentAvailability as jest.Mock).mockResolvedValue([
      {
        id: 'busy-1',
        examId: 'exam-1',
        scheduledAt: busySlot.toISOString(),
        status: 'SCHEDULED',
      },
    ]);

    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    expect(result.current.eventPropGetter({ status: 'PENDING' }).style).toEqual(
      expect.objectContaining({
        color: '#92400e',
      }),
    );
    expect(result.current.eventPropGetter({ status: 'SCHEDULED' }).style).toEqual(
      expect.objectContaining({
        color: '#1e40af',
      }),
    );

    expect(result.current.slotPropGetter(new Date('invalid') as never)).toEqual({});

    const availableSlot = makeDate(4, 7);
    const pastSlot = makeDate(-2, 8);

    expect(result.current.slotPropGetter(busySlot)).toEqual({ className: 'ep-slot-busy' });
    expect(result.current.slotPropGetter(availableSlot)).toEqual({
      className: 'ep-slot-available',
    });

    act(() => {
      result.current.setSelectedSlotStart(availableSlot);
    });

    expect(result.current.slotPropGetter(availableSlot)).toEqual({
      className: 'ep-slot-available ep-slot-selected',
    });
    expect(result.current.slotPropGetter(pastSlot)).toEqual({
      className: 'ep-slot-unavailable',
    });

    act(() => {
      result.current.handleView(Views.MONTH);
      result.current.handleNavigate(new Date());
    });

    await waitFor(() => {
      expect(result.current.isLoadingAvailability).toBe(false);
    });

    const now = new Date();
    const futureDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const pastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);

    expect(result.current.dayPropGetter(new Date('invalid') as never)).toEqual({});
    expect(result.current.dayPropGetter(futureDay)).toEqual({ className: 'ep-month-day-available' });
    expect(result.current.dayPropGetter(pastDay)).toEqual({ className: 'ep-month-day-unavailable' });
    expect(result.current.dayPropGetter(busySlot)).toEqual({ className: 'ep-month-day-busy' });
  });

  it('guards navigation and formats select-event feedback', async () => {
    const { result } = renderSchedulingHook();
    await waitForInitialLoad(result);

    const initialDate = result.current.viewDate;

    act(() => {
      result.current.handleNavigate(new Date('invalid'));
    });

    expect(result.current.viewDate).toBe(initialDate);

    act(() => {
      result.current.handleSelectEvent({
        start: new Date('invalid'),
        status: 'SCHEDULED',
      } as never);
    });

    expect(publishMock).not.toHaveBeenCalledWith(
      'error',
      expect.stringContaining('Escolha um horário disponível'),
    );

    const busySlot = makeDate(2, 10);

    act(() => {
      result.current.handleSelectEvent({
        start: busySlot,
        status: 'SCHEDULED',
      });
    });

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('Agendado em'),
    );
  });
});
