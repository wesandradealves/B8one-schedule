import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ExamSchedulingCalendarSection } from '@/components/organisms/protected/exam-scheduling-calendar-section';
import {
  createAppointment,
  listAppointmentAvailability,
} from '@/services/appointments.service';
import { getExamById } from '@/services/exams.service';

const publishMock = jest.fn();
const pushMock = jest.fn();
const defaultCalendarSlot = new Date('2099-01-01T10:00:00.000Z');
let mockedCalendarSlot = defaultCalendarSlot;
type CalendarMockProps = {
  components?: {
    month?: {
      dateHeader?: (props: { date: Date; label: string }) => ReactNode;
    };
  };
  messages?: {
    previous?: string;
    next?: string;
    today?: string;
    day?: string;
    week?: string;
    month?: string;
  };
  onSelectSlot: (slot: { start: Date; end: Date }) => void;
  onSelecting?: (slot: { start: Date; end: Date }) => boolean;
  onView?: (view: 'day' | 'week' | 'month') => void;
  selectable?: 'ignoreEvents' | boolean;
  views?: Array<'day' | 'week' | 'month'>;
};
let latestCalendarProps: CalendarMockProps | null = null;

jest.mock('react-big-calendar', () => ({
  Calendar: (props: CalendarMockProps) => {
    latestCalendarProps = props;
    const monthDateHeader = props.components?.month?.dateHeader;
    return (
      <>
        <button
          type="button"
          onClick={() =>
            props.onSelectSlot({
              start: mockedCalendarSlot,
              end: new Date(mockedCalendarSlot.getTime() + 30 * 60_000),
            })
          }
        >
          selecionar-slot
        </button>
        <button type="button" onClick={() => props.onView?.('month')}>
          mudar-month
        </button>
        {monthDateHeader ? monthDateHeader({ date: mockedCalendarSlot, label: '01' }) : null}
      </>
    );
  },
  dateFnsLocalizer: jest.fn(() => ({})),
  Views: {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
  },
}));

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

describe('ExamSchedulingCalendarSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCalendarSlot = defaultCalendarSlot;
    latestCalendarProps = null;

    (getExamById as jest.Mock).mockResolvedValue({
      id: 'exam-1',
      name: 'Hemograma',
      description: null,
      durationMinutes: 30,
      priceCents: 10000,
      availableWeekdays: [1, 2, 3, 4, 5],
      availableStartTime: '07:00',
      availableEndTime: '19:00',
      availableFromDate: null,
      availableToDate: null,
    });
    (listAppointmentAvailability as jest.Mock).mockResolvedValue([]);
  });

  it('loads exam and availability', async () => {
    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(getExamById).toHaveBeenCalledWith('exam-1');
    });

    await waitFor(() => {
      expect(listAppointmentAvailability).toHaveBeenCalledTimes(1);
    });

    expect(latestCalendarProps?.selectable).toBe('ignoreEvents');
    expect(typeof latestCalendarProps?.onSelectSlot).toBe('function');
    expect(typeof latestCalendarProps?.onSelecting).toBe('function');
    expect(latestCalendarProps?.views).toEqual(['day', 'week', 'month']);
    expect(latestCalendarProps?.messages?.today).toBe('Hoje');
    expect(latestCalendarProps?.messages?.previous).toBe('Anterior');
    expect(latestCalendarProps?.messages?.next).toBe('Próximo');
    expect(latestCalendarProps?.messages?.day).toBe('Dia');
    expect(latestCalendarProps?.messages?.week).toBe('Semana');
    expect(latestCalendarProps?.messages?.month).toBe('Mês');
  });

  it('blocks busy slot selection', async () => {
    (listAppointmentAvailability as jest.Mock).mockResolvedValue([
      {
        id: 'appointment-1',
        examId: 'exam-1',
        scheduledAt: mockedCalendarSlot.toISOString(),
        status: 'PENDING',
      },
    ]);

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(screen.getByText('selecionar-slot')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(listAppointmentAvailability).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(
        screen.queryByText('• atualizando disponibilidade...'),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('selecionar-slot'));

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Este horário já está ocupado para o exame selecionado.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('blocks slot selection outside operation window', async () => {
    mockedCalendarSlot = new Date('2099-01-01T06:30:00.000Z');

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(screen.getByText('selecionar-slot')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('selecionar-slot'));

    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Selecione um horário dentro da disponibilidade do exame.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirms appointment scheduling with modal', async () => {
    (createAppointment as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'PENDING',
    });

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(screen.getByText('selecionar-slot')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('selecionar-slot'));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar agendamento' }));

    await waitFor(() => {
      expect(createAppointment).toHaveBeenCalledWith({
        examId: 'exam-1',
        scheduledAt: mockedCalendarSlot.toISOString(),
      });
    });

    expect(pushMock).toHaveBeenCalledWith('/app/appointments');
  });

  it('selects first available slot when clicking a day in month view', async () => {
    (createAppointment as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'PENDING',
    });
    mockedCalendarSlot = new Date(2099, 0, 1, 0, 0, 0, 0);

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(screen.getByText('mudar-month')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByText('• atualizando disponibilidade...'),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('mudar-month'));

    await waitFor(() => {
      expect(
        screen.queryByText('• atualizando disponibilidade...'),
      ).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('selecionar-slot'));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar agendamento' }));

    const expectedMonthSlot = new Date(mockedCalendarSlot);
    expectedMonthSlot.setHours(7, 0, 0, 0);

    await waitFor(() => {
      expect(createAppointment).toHaveBeenCalledWith({
        examId: 'exam-1',
        scheduledAt: expectedMonthSlot.toISOString(),
      });
    });
  });

  it('selects month day from date header button', async () => {
    (createAppointment as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'PENDING',
    });
    mockedCalendarSlot = new Date(2099, 0, 1, 0, 0, 0, 0);

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    await waitFor(() => {
      expect(screen.getByText('mudar-month')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('mudar-month'));
    await waitFor(() => {
      expect(
        screen.queryByText('• atualizando disponibilidade...'),
      ).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: '01' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar agendamento' }));

    const expectedMonthSlot = new Date(mockedCalendarSlot);
    expectedMonthSlot.setHours(7, 0, 0, 0);

    await waitFor(() => {
      expect(createAppointment).toHaveBeenCalledWith({
        examId: 'exam-1',
        scheduledAt: expectedMonthSlot.toISOString(),
      });
    });
  });

  it('renders skeleton while exam is loading', async () => {
    (getExamById as jest.Mock).mockImplementation(
      () => new Promise(() => undefined),
    );

    render(<ExamSchedulingCalendarSection examId="exam-1" />);

    expect(screen.getByText('Agendamento')).toBeInTheDocument();
    expect(screen.queryByText('Carregando dados do exame...')).not.toBeInTheDocument();
  });
});
