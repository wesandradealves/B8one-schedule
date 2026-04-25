'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  Calendar,
  dateFnsLocalizer,
  type DateHeaderProps,
  type SlotInfo,
  type View,
  Views,
} from 'react-big-calendar';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActionConfirmDialog } from '@/components/molecules/action-confirm-dialog';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { createAppointment, listAppointmentAvailability } from '@/services/appointments.service';
import { getExamById } from '@/services/exams.service';
import type {
  AppointmentAvailabilitySlot,
  AppointmentStatus,
} from '@/types/appointment';
import type { Exam } from '@/types/exam';
import { useFeedback } from '@/hooks/useFeedback';
import { getRequestErrorMessage } from '@/utils/request';
import { APP_ROUTES } from '@/utils/route';
import { formatDateTime } from '@/utils/format';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const calendarMessages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+${total} mais`,
};

const OPERATION_START_HOUR = 7;
const OPERATION_END_HOUR = 19;

const toMinutesOfDay = (date: Date): number => date.getHours() * 60 + date.getMinutes();

const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

const isWithinOperationWindow = (start: Date, durationMinutes: number): boolean => {
  if (!isValidDate(start)) {
    return false;
  }

  const end = new Date(start.getTime() + durationMinutes * 60_000);
  if (!isValidDate(end)) {
    return false;
  }

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (!isSameDay) {
    return false;
  }

  const startMinutes = toMinutesOfDay(start);
  const endMinutes = toMinutesOfDay(end);
  return startMinutes >= OPERATION_START_HOUR * 60 && endMinutes <= OPERATION_END_HOUR * 60;
};

const CalendarCard = styled.section.attrs({
  className: 'mt-6 rounded-2xl border bg-white p-4 shadow-sm',
})`
  border-color: var(--color-border);
`;

const CalendarFrame = styled.div.attrs({
  className: 'mt-4 overflow-hidden rounded-xl border',
})`
  border-color: var(--color-border);

  .rbc-calendar {
    min-height: 640px;
    color: var(--color-text-primary);
  }

  .rbc-toolbar button {
    border-color: var(--color-border);
    color: var(--color-text-primary);
    background: var(--color-background);
  }

  .rbc-toolbar button.rbc-active {
    background: var(--color-brand-500);
    border-color: var(--color-brand-500);
    color: var(--color-background);
  }

  .rbc-time-view,
  .rbc-month-view {
    border-color: var(--color-border);
  }

  .rbc-time-header-content,
  .rbc-time-content,
  .rbc-timeslot-group,
  .rbc-header,
  .rbc-day-bg + .rbc-day-bg,
  .rbc-month-row + .rbc-month-row {
    border-color: var(--color-border);
  }

  .rbc-month-view .rbc-day-bg {
    position: relative;
  }

  .rbc-month-view .rbc-date-cell {
    overflow: visible;
    padding: 4px 6px 0;
  }

  .rbc-time-slot {
    position: relative;
  }

  .ep-slot-available {
    background-color: rgba(16, 185, 129, 0.2) !important;
    cursor: pointer !important;
  }

  .ep-slot-available::after {
    content: 'LIVRE';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    color: rgba(5, 150, 105, 0.85);
    pointer-events: none;
  }

  .ep-slot-available:hover {
    background-color: rgba(16, 185, 129, 0.3) !important;
    box-shadow: inset 0 0 0 1px rgba(5, 150, 105, 0.35);
  }

  .ep-slot-selected {
    background-color: rgba(16, 185, 129, 0.4) !important;
    box-shadow: inset 0 0 0 2px rgba(5, 150, 105, 0.45);
  }

  .ep-slot-busy {
    background-color: rgba(148, 163, 184, 0.26) !important;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(148, 163, 184, 0.16),
      rgba(148, 163, 184, 0.16) 6px,
      rgba(148, 163, 184, 0.05) 6px,
      rgba(148, 163, 184, 0.05) 12px
    );
    cursor: not-allowed !important;
  }

  .ep-slot-busy::after {
    content: 'RESERVADO';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    color: rgba(71, 85, 105, 0.9);
    pointer-events: none;
  }

  .ep-slot-unavailable {
    background-color: rgba(148, 163, 184, 0.14) !important;
    cursor: not-allowed !important;
  }

  .ep-slot-unavailable::after {
    content: 'INDISP.';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    color: rgba(100, 116, 139, 0.85);
    pointer-events: none;
  }

  .ep-month-day-available {
    background: rgba(16, 185, 129, 0.18);
    cursor: pointer;
  }

  .ep-month-day-busy {
    background: rgba(148, 163, 184, 0.26);
    cursor: not-allowed;
  }

  .ep-month-day-unavailable {
    background: rgba(148, 163, 184, 0.14);
    cursor: not-allowed;
  }

  .ep-month-day-available::after,
  .ep-month-day-busy::after,
  .ep-month-day-unavailable::after {
    position: absolute;
    left: 8px;
    bottom: 8px;
    border-radius: 9999px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
    pointer-events: none;
  }

  .ep-month-day-available::after {
    content: 'LIVRE';
    background: rgba(16, 185, 129, 0.2);
    color: rgba(5, 150, 105, 0.95);
  }

  .ep-month-day-busy::after {
    content: 'RESERVADO';
    background: rgba(148, 163, 184, 0.34);
    color: rgba(51, 65, 85, 0.95);
  }

  .ep-month-day-unavailable::after {
    content: 'INDISP.';
    background: rgba(148, 163, 184, 0.2);
    color: rgba(100, 116, 139, 0.95);
  }

  .ep-month-date-header {
    display: flex;
    justify-content: flex-end;
    line-height: 1.1;
  }

  .ep-month-date-button {
    border: 0;
    background: transparent;
    border-radius: 9999px;
    min-width: 30px;
    min-height: 24px;
    padding: 2px 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    cursor: pointer;
  }

  .ep-month-date-button:hover {
    background: rgba(37, 99, 235, 0.12);
  }

  .ep-month-date-button:focus-visible {
    outline: 2px solid rgba(37, 99, 235, 0.5);
    outline-offset: 1px;
  }

  .ep-month-date-button-available {
    color: rgba(5, 150, 105, 0.95);
  }

  .ep-month-date-button-busy {
    color: rgba(71, 85, 105, 0.95);
  }

  .ep-month-date-button-unavailable {
    color: rgba(100, 116, 139, 0.95);
  }
`;

const SummaryRow = styled.div.attrs({
  className: 'mt-2 flex flex-wrap items-center gap-2 text-sm',
})`
  color: var(--color-text-secondary);
`;

const LegendBadge = styled.span.attrs<{ $status: AppointmentStatus }>(({ $status }) => ({
  className:
    'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ' +
    ($status === 'PENDING'
      ? 'bg-amber-100 text-amber-700'
      : $status === 'SCHEDULED'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-slate-200 text-slate-700'),
}))<{ $status: AppointmentStatus }>``;

const SlotLegendBadge = styled.span.attrs<{ $kind: 'available' | 'blocked' }>(({ $kind }) => ({
  className:
    'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ' +
    ($kind === 'available'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-200 text-slate-700'),
}))<{ $kind: 'available' | 'blocked' }>``;

const EmptyState = styled.p.attrs({
  className: 'mt-6 rounded-2xl border px-4 py-8 text-center text-sm',
})`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
`;

const SkeletonBar = styled.div.attrs<{ $widthClass?: string }>(({ $widthClass }) => ({
  className: `h-4 animate-pulse rounded-md bg-slate-200 ${$widthClass ?? 'w-full'}`,
}))<{ $widthClass?: string }>``;

const SkeletonCalendar = styled.div.attrs({
  className: 'h-[640px] animate-pulse rounded-xl border bg-slate-100/70',
})`
  border-color: var(--color-border);
`;

const toRange = (baseDate: Date, view: View): { startsAt: Date; endsAt: Date } => {
  if (view === Views.DAY) {
    return {
      startsAt: startOfDay(baseDate),
      endsAt: endOfDay(baseDate),
    };
  }

  if (view === Views.MONTH) {
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);
    return {
      startsAt: startOfWeek(monthStart, { weekStartsOn: 0 }),
      endsAt: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
  }

  return {
    startsAt: startOfWeek(baseDate, { weekStartsOn: 0 }),
    endsAt: endOfWeek(baseDate, { weekStartsOn: 0 }),
  };
};

const toStatusLabel = (status: AppointmentStatus): string => {
  if (status === 'PENDING') {
    return 'Pendente';
  }

  if (status === 'CANCELLED') {
    return 'Cancelado';
  }

  return 'Agendado';
};

interface ExamSchedulingCalendarSectionProps {
  examId: string;
}

interface SlotValidationOptions {
  allowMonthSelection?: boolean;
}

type DayAvailabilityTone = 'available' | 'busy' | 'unavailable';

interface DayAvailabilityMeta {
  tone: DayAvailabilityTone;
}

const dayKey = (value: Date): string => format(value, 'yyyy-MM-dd');

export function ExamSchedulingCalendarSection({ examId }: ExamSchedulingCalendarSectionProps) {
  const router = useRouter();
  const { publish } = useFeedback();
  const [exam, setExam] = useState<Exam | null>(null);
  const [availability, setAvailability] = useState<AppointmentAvailabilitySlot[]>([]);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlotStart, setSelectedSlotStart] = useState<Date | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const viewRange = useMemo(() => toRange(viewDate, view), [view, viewDate]);
  const slotStep = useMemo(() => {
    if (!exam?.durationMinutes || exam.durationMinutes <= 0) {
      return 30;
    }

    return exam.durationMinutes;
  }, [exam?.durationMinutes]);

  const occupiedTimestampSet = useMemo(() => {
    return new Set(
      availability.map((appointment) => new Date(appointment.scheduledAt).getTime()),
    );
  }, [availability]);
  const getSlotSelectionError = useCallback(
    (slotStart: Date, options?: SlotValidationOptions): string | null => {
      if (!isValidDate(slotStart)) {
        return 'Não foi possível identificar o horário selecionado.';
      }

      if (view === Views.MONTH && !options?.allowMonthSelection) {
        return 'Selecione um horário nos modos Dia ou Semana.';
      }

      if (slotStart.getTime() <= Date.now()) {
        return 'Escolha um horário futuro para solicitar o agendamento.';
      }

      if (!isWithinOperationWindow(slotStart, slotStep)) {
        return 'Selecione um horário entre 07:00 e 19:00.';
      }

      if (occupiedTimestampSet.has(slotStart.getTime())) {
        return 'Este horário já está ocupado para o exame selecionado.';
      }

      return null;
    },
    [occupiedTimestampSet, slotStep, view],
  );

  const findFirstAvailableSlotInDay = useCallback(
    (day: Date): Date | null => {
      if (!isValidDate(day)) {
        return null;
      }

      const cursor = new Date(day);
      cursor.setHours(OPERATION_START_HOUR, 0, 0, 0);

      while (isWithinOperationWindow(cursor, slotStep)) {
        const validationError = getSlotSelectionError(cursor, {
          allowMonthSelection: true,
        });

        if (!validationError) {
          return new Date(cursor);
        }

        cursor.setMinutes(cursor.getMinutes() + slotStep);
      }

      return null;
    },
    [getSlotSelectionError, slotStep],
  );

  const availabilityEvents = useMemo(() => {
    return availability.map((appointment) => {
      const start = new Date(appointment.scheduledAt);
      const end = new Date(start.getTime() + slotStep * 60_000);
      return {
        id: appointment.id,
        title: toStatusLabel(appointment.status),
        start,
        end,
        status: appointment.status,
      };
    });
  }, [availability, slotStep]);

  const dayAvailabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailabilityMeta>();
    const cursor = new Date(viewRange.startsAt);
    const rangeEnd = new Date(viewRange.endsAt);

    while (cursor.getTime() <= rangeEnd.getTime()) {
      const dayStart = new Date(cursor);
      dayStart.setHours(OPERATION_START_HOUR, 0, 0, 0);

      let hasAvailable = false;
      let hasBusy = false;
      let slotCursor = new Date(dayStart);

      while (isWithinOperationWindow(slotCursor, slotStep)) {
        if (slotCursor.getTime() > Date.now()) {
          if (occupiedTimestampSet.has(slotCursor.getTime())) {
            hasBusy = true;
          } else {
            hasAvailable = true;
          }
        }

        slotCursor = new Date(slotCursor.getTime() + slotStep * 60_000);
      }

      if (hasAvailable) {
        map.set(dayKey(cursor), {
          tone: 'available',
        });
      } else if (hasBusy) {
        map.set(dayKey(cursor), {
          tone: 'busy',
        });
      } else {
        map.set(dayKey(cursor), {
          tone: 'unavailable',
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return map;
  }, [occupiedTimestampSet, slotStep, viewRange.endsAt, viewRange.startsAt]);

  const fetchAvailability = useCallback(async () => {
    if (!exam) {
      setAvailability([]);
      setIsLoadingAvailability(false);
      return;
    }

    setIsLoadingAvailability(true);
    try {
      const occupiedSlots = await listAppointmentAvailability({
        examId: exam.id,
        startsAt: viewRange.startsAt.toISOString(),
        endsAt: viewRange.endsAt.toISOString(),
      });
      setAvailability(occupiedSlots);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
      setAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [exam, publish, viewRange.endsAt, viewRange.startsAt]);

  useEffect(() => {
    let isMounted = true;

    const fetchExam = async () => {
      setIsLoadingExam(true);
      try {
        const examResponse = await getExamById(examId);
        if (!isMounted) {
          return;
        }

        setExam(examResponse);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        publish('error', getRequestErrorMessage(error));
        setExam(null);
      } finally {
        if (isMounted) {
          setIsLoadingExam(false);
        }
      }
    };

    void fetchExam();

    return () => {
      isMounted = false;
    };
  }, [examId, publish]);

  useEffect(() => {
    void fetchAvailability();
  }, [fetchAvailability]);

  const handleMonthDaySelection = useCallback(
    (day: Date) => {
      if (isLoadingAvailability || isSubmitting || !isValidDate(day)) {
        return;
      }

      const firstAvailableSlot = findFirstAvailableSlotInDay(day);
      if (!firstAvailableSlot) {
        publish('error', 'Não há horários disponíveis neste dia.');
        return;
      }

      const validationError = getSlotSelectionError(firstAvailableSlot, {
        allowMonthSelection: true,
      });
      if (validationError) {
        publish('error', validationError);
        return;
      }

      setSelectedSlotStart(firstAvailableSlot);
    },
    [
      findFirstAvailableSlotInDay,
      getSlotSelectionError,
      isLoadingAvailability,
      isSubmitting,
      publish,
    ],
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      if (isLoadingAvailability || isSubmitting) {
        return;
      }

      const start = slotInfo.start;
      if (!isValidDate(start)) {
        return;
      }

      if (view === Views.MONTH) {
        handleMonthDaySelection(start);
        return;
      }

      const validationError = getSlotSelectionError(start, {
        allowMonthSelection: true,
      });
      if (validationError) {
        publish('error', validationError);
        return;
      }

      setSelectedSlotStart(start);
    },
    [
      getSlotSelectionError,
      handleMonthDaySelection,
      isLoadingAvailability,
      isSubmitting,
      publish,
      view,
    ],
  );

  const handleConfirmSchedule = useCallback(async () => {
    if (!selectedSlotStart || !exam) {
      return;
    }

    const validationError = getSlotSelectionError(selectedSlotStart, {
      allowMonthSelection: true,
    });
    if (validationError) {
      publish('error', validationError);
      setSelectedSlotStart(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAppointment({
        examId: exam.id,
        scheduledAt: selectedSlotStart.toISOString(),
      });

      publish(
        'success',
        created.status === 'PENDING'
          ? 'Solicitação enviada e aguardando aprovação do administrador.'
          : 'Agendamento criado com sucesso.',
      );

      setSelectedSlotStart(null);
      router.push(APP_ROUTES.appointments);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [exam, getSlotSelectionError, publish, router, selectedSlotStart]);

  const eventPropGetter = useCallback(
    (event: { status: AppointmentStatus }) => {
      if (event.status === 'PENDING') {
        return {
          style: {
            background: 'rgba(245, 158, 11, 0.18)',
            borderColor: 'rgba(245, 158, 11, 0.45)',
            color: '#92400e',
          },
        };
      }

      return {
        style: {
          background: 'rgba(37, 99, 235, 0.16)',
          borderColor: 'rgba(37, 99, 235, 0.45)',
          color: '#1e40af',
        },
      };
    },
    [],
  );

  const slotPropGetter = useCallback(
    (date: Date) => {
      if (!isValidDate(date)) {
        return {};
      }

      const isPast = date.getTime() <= Date.now();
      const isBusy = occupiedTimestampSet.has(date.getTime());
      const isOutOfWindow = !isWithinOperationWindow(date, slotStep);
      const isSelected =
        selectedSlotStart !== null && selectedSlotStart.getTime() === date.getTime();

      if (!isPast && !isBusy && !isOutOfWindow) {
        return {
          className: isSelected ? 'ep-slot-available ep-slot-selected' : 'ep-slot-available',
        };
      }

      return {
        className: isBusy ? 'ep-slot-busy' : 'ep-slot-unavailable',
      };
    },
    [occupiedTimestampSet, selectedSlotStart, slotStep],
  );

  const dayPropGetter = useCallback(
    (date: Date) => {
      if (view !== Views.MONTH || !isValidDate(date)) {
        return {};
      }

      const meta = dayAvailabilityMap.get(dayKey(date));
      if (!meta) {
        return {};
      }

      if (meta.tone === 'available') {
        return { className: 'ep-month-day-available' };
      }

      if (meta.tone === 'busy') {
        return { className: 'ep-month-day-busy' };
      }

      return { className: 'ep-month-day-unavailable' };
    },
    [dayAvailabilityMap, view],
  );

  const calendarComponents = useMemo(
    () => ({
      month: {
        dateHeader: ({ date, label }: DateHeaderProps) => {
          const meta = dayAvailabilityMap.get(dayKey(date));
          const toneClass = meta?.tone ?? 'unavailable';

          return (
            <div className="ep-month-date-header">
              <button
                className={`ep-month-date-button ep-month-date-button-${toneClass}`}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleMonthDaySelection(date);
                }}
              >
                {label}
              </button>
            </div>
          );
        },
      },
    }),
    [dayAvailabilityMap, handleMonthDaySelection],
  );

  if (isLoadingExam) {
    return (
      <PageContainer>
        <PageTitle>Agendamento</PageTitle>
        <CalendarCard>
          <div className="space-y-3">
            <SkeletonBar $widthClass="w-36" />
            <SkeletonBar $widthClass="w-52" />
            <SkeletonCalendar className="mt-4" />
          </div>
        </CalendarCard>
      </PageContainer>
    );
  }

  if (!exam) {
    return (
      <PageContainer>
        <PageTitle>Agendamento</PageTitle>
        <PageDescription>Não foi possível carregar o exame informado.</PageDescription>
        <EmptyState>Verifique o exame selecionado e tente novamente.</EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Agenda de {exam.name}</PageTitle>
      <PageDescription>
        Selecione um horário livre para solicitar seu agendamento. Pedidos de cliente
        entram com status pendente de aprovação.
      </PageDescription>

      <CalendarCard>
        <SummaryRow>
          <LegendBadge $status="PENDING">Pendente</LegendBadge>
          <span>aguardando aprovação</span>
          <LegendBadge $status="SCHEDULED">Agendado</LegendBadge>
          <span>confirmado</span>
          <SlotLegendBadge $kind="available">Disponível</SlotLegendBadge>
          <span>verde e clicável</span>
          <SlotLegendBadge $kind="blocked">Indisponível</SlotLegendBadge>
          <span>reservado, passado ou fora da janela</span>
        </SummaryRow>
        <SummaryRow>
          <span>Duração: {exam.durationMinutes} minutos</span>
          <span>•</span>
          <span>Operação: 07:00 às 19:00</span>
          {isLoadingAvailability ? <span>• atualizando disponibilidade...</span> : null}
        </SummaryRow>

        <CalendarFrame>
          <Calendar
            culture="pt-BR"
            date={viewDate}
            defaultView={Views.WEEK}
            components={calendarComponents}
            dayPropGetter={dayPropGetter}
            endAccessor="end"
            eventPropGetter={eventPropGetter}
            events={availabilityEvents}
            localizer={localizer}
            max={new Date(1970, 1, 1, 19, 0, 0)}
            min={new Date(1970, 1, 1, 7, 0, 0)}
            messages={calendarMessages}
            selectable="ignoreEvents"
            slotPropGetter={slotPropGetter}
            startAccessor="start"
            step={slotStep}
            timeslots={1}
            view={view}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            onNavigate={(nextDate: Date) => {
              setViewDate(nextDate);
            }}
            onSelectEvent={(event: { start: Date; status: AppointmentStatus }) => {
              if (!isValidDate(event.start)) {
                return;
              }

              publish(
                'error',
                `${toStatusLabel(event.status)} em ${formatDateTime(event.start.toISOString())}. Escolha um horário disponível.`,
              );
            }}
            onSelectSlot={handleSelectSlot}
            onView={(nextView: View) => {
              setView(nextView);
            }}
          />
        </CalendarFrame>
      </CalendarCard>

      <ActionConfirmDialog
        confirmLabel="Confirmar agendamento"
        confirmVariant="save"
        description={
          selectedSlotStart
            ? `Deseja enviar o pedido para ${formatDateTime(selectedSlotStart.toISOString())}?`
            : 'Deseja confirmar o agendamento selecionado?'
        }
        isOpen={selectedSlotStart !== null}
        isSubmitting={isSubmitting}
        title="Confirmar solicitação"
        onCancel={() => setSelectedSlotStart(null)}
        onConfirm={() => void handleConfirmSchedule()}
      />
    </PageContainer>
  );
}
