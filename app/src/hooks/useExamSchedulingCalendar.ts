'use client';

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { type DateHeaderProps, type SlotInfo, type View, Views } from 'react-big-calendar';
import {
  createAppointment,
  listAppointmentAvailability,
} from '@/services/appointments.service';
import { getExamById } from '@/services/exams.service';
import { useFeedback } from '@/hooks/useFeedback';
import type {
  AppointmentAvailabilitySlot,
  AppointmentStatus,
} from '@/types/appointment';
import type { Exam } from '@/types/exam';
import type { ExamAvailabilityConfig } from '@/utils/exam-availability';
import {
  isDateInsideExamAvailabilityDay,
  isWithinExamAvailability,
  normalizeExamAvailability,
  toTimeMinutes,
} from '@/utils/exam-availability';
import { formatDateTime } from '@/utils/format';
import { toAppointmentStatusLabel } from '@/utils/appointment';
import {
  getDayAvailabilityKey,
  isValidCalendarDate,
  toViewRange,
} from '@/utils/exam-scheduling-calendar';
import { getRequestErrorMessage } from '@/utils/request';
import { APP_ROUTES } from '@/utils/route';

interface UseExamSchedulingCalendarParams {
  examId: string;
}

interface SlotValidationOptions {
  allowMonthSelection?: boolean;
}

type DayAvailabilityTone = 'available' | 'busy' | 'unavailable';

interface DayAvailabilityMeta {
  tone: DayAvailabilityTone;
}

interface AvailabilityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
}

export interface UseExamSchedulingCalendarOutput {
  exam: Exam | null;
  examAvailability: ExamAvailabilityConfig;
  isLoadingExam: boolean;
  isLoadingAvailability: boolean;
  isSubmitting: boolean;
  selectedSlotStart: Date | null;
  slotStep: number;
  view: View;
  viewDate: Date;
  availabilityEvents: AvailabilityEvent[];
  calendarComponents: {
    month: {
      dateHeader: (props: DateHeaderProps) => ReactNode;
    };
  };
  handleNavigate: (nextDate: Date) => void;
  handleView: (nextView: View) => void;
  handleSelecting: (range: { start: Date; end: Date }) => boolean;
  handleSelectSlot: (slotInfo: SlotInfo) => void;
  handleSelectEvent: (event: { start: Date; status: AppointmentStatus }) => void;
  handleConfirmSchedule: () => Promise<void>;
  eventPropGetter: (event: { status: AppointmentStatus }) => { style: CSSProperties };
  slotPropGetter: (date: Date) => { className?: string };
  dayPropGetter: (date: Date) => { className?: string };
  setSelectedSlotStart: (value: Date | null) => void;
}

export const useExamSchedulingCalendar = ({
  examId,
}: UseExamSchedulingCalendarParams): UseExamSchedulingCalendarOutput => {
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

  const viewRange = useMemo(() => toViewRange(viewDate, view), [view, viewDate]);

  const slotStep = useMemo(() => {
    if (!exam?.durationMinutes || exam.durationMinutes <= 0) {
      return 30;
    }

    return exam.durationMinutes;
  }, [exam?.durationMinutes]);

  const examAvailability = useMemo(
    () => normalizeExamAvailability(exam),
    [exam],
  );

  const dayStartMinutes = useMemo(() => {
    return toTimeMinutes(examAvailability.availableStartTime) ?? 0;
  }, [examAvailability.availableStartTime]);

  const dayEndMinutes = useMemo(() => {
    return toTimeMinutes(examAvailability.availableEndTime) ?? 24 * 60;
  }, [examAvailability.availableEndTime]);

  const occupiedTimestampSet = useMemo(() => {
    return new Set(
      availability
        .map((appointment) => new Date(appointment.scheduledAt).getTime())
        .filter((timestamp) => Number.isFinite(timestamp)),
    );
  }, [availability]);

  const getSlotSelectionError = useCallback(
    (slotStart: Date, options?: SlotValidationOptions): string | null => {
      if (!isValidCalendarDate(slotStart)) {
        return 'Não foi possível identificar o horário selecionado.';
      }

      if (view === Views.MONTH && !options?.allowMonthSelection) {
        return 'Selecione um horário nos modos Dia ou Semana.';
      }

      if (slotStart.getTime() <= Date.now()) {
        return 'Escolha um horário futuro para solicitar o agendamento.';
      }

      if (!isWithinExamAvailability(slotStart, slotStep, examAvailability)) {
        return 'Selecione um horário dentro da disponibilidade do exame.';
      }

      if (occupiedTimestampSet.has(slotStart.getTime())) {
        return 'Este horário já está ocupado para o exame selecionado.';
      }

      return null;
    },
    [examAvailability, occupiedTimestampSet, slotStep, view],
  );

  const findFirstAvailableSlotInDay = useCallback(
    (day: Date): Date | null => {
      if (
        !isValidCalendarDate(day) ||
        !isDateInsideExamAvailabilityDay(day, examAvailability)
      ) {
        return null;
      }

      const cursor = new Date(day);
      cursor.setHours(Math.floor(dayStartMinutes / 60), dayStartMinutes % 60, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(Math.floor(dayEndMinutes / 60), dayEndMinutes % 60, 0, 0);

      while (cursor.getTime() < dayEnd.getTime()) {
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
    [dayEndMinutes, dayStartMinutes, examAvailability, getSlotSelectionError, slotStep],
  );

  const resolveSlotStartByView = useCallback(
    (slotStart: Date): Date | null => {
      if (!isValidCalendarDate(slotStart)) {
        return null;
      }

      if (view !== Views.MONTH) {
        return slotStart;
      }

      return findFirstAvailableSlotInDay(slotStart);
    },
    [findFirstAvailableSlotInDay, view],
  );

  const availabilityEvents = useMemo<AvailabilityEvent[]>(() => {
    return availability.flatMap((appointment) => {
      const start = new Date(appointment.scheduledAt);
      if (!isValidCalendarDate(start)) {
        return [];
      }

      const end = new Date(start.getTime() + slotStep * 60_000);

      return [
        {
          id: appointment.id,
          title: toAppointmentStatusLabel(appointment.status),
          start,
          end,
          status: appointment.status,
        },
      ];
    });
  }, [availability, slotStep]);

  const dayAvailabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailabilityMeta>();
    const cursor = new Date(viewRange.startsAt);
    const rangeEnd = new Date(viewRange.endsAt);

    while (cursor.getTime() <= rangeEnd.getTime()) {
      let hasAvailable = false;
      let hasBusy = false;

      if (isDateInsideExamAvailabilityDay(cursor, examAvailability)) {
        const dayStart = new Date(cursor);
        dayStart.setHours(
          Math.floor(dayStartMinutes / 60),
          dayStartMinutes % 60,
          0,
          0,
        );
        const dayEnd = new Date(cursor);
        dayEnd.setHours(
          Math.floor(dayEndMinutes / 60),
          dayEndMinutes % 60,
          0,
          0,
        );
        let slotCursor = new Date(dayStart);

        while (slotCursor.getTime() < dayEnd.getTime()) {
          const isSchedulable = isWithinExamAvailability(
            slotCursor,
            slotStep,
            examAvailability,
          );

          if (slotCursor.getTime() > Date.now() && isSchedulable) {
            if (occupiedTimestampSet.has(slotCursor.getTime())) {
              hasBusy = true;
            } else {
              hasAvailable = true;
            }
          }

          slotCursor = new Date(slotCursor.getTime() + slotStep * 60_000);
        }
      }

      if (hasAvailable) {
        map.set(getDayAvailabilityKey(cursor), {
          tone: 'available',
        });
      } else if (hasBusy) {
        map.set(getDayAvailabilityKey(cursor), {
          tone: 'busy',
        });
      } else {
        map.set(getDayAvailabilityKey(cursor), {
          tone: 'unavailable',
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return map;
  }, [
    dayEndMinutes,
    dayStartMinutes,
    examAvailability,
    occupiedTimestampSet,
    slotStep,
    viewRange.endsAt,
    viewRange.startsAt,
  ]);

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
      if (isLoadingAvailability || isSubmitting || !isValidCalendarDate(day)) {
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

  const handleSelecting = useCallback(
    (range: { start: Date; end: Date }): boolean => {
      if (isLoadingAvailability || isSubmitting) {
        return false;
      }

      if (!isValidCalendarDate(range.start)) {
        return false;
      }

      if (view === Views.MONTH) {
        return true;
      }

      const validationError = getSlotSelectionError(range.start, {
        allowMonthSelection: true,
      });

      return !validationError;
    },
    [getSlotSelectionError, isLoadingAvailability, isSubmitting, view],
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      if (isLoadingAvailability || isSubmitting) {
        return;
      }

      if (!isValidCalendarDate(slotInfo.start)) {
        publish('error', 'Não foi possível identificar o horário selecionado.');
        return;
      }

      const resolvedSlotStart = resolveSlotStartByView(slotInfo.start);

      if (!resolvedSlotStart) {
        publish('error', 'Não há horários disponíveis neste dia.');
        return;
      }

      if (view === Views.MONTH) {
        setSelectedSlotStart(resolvedSlotStart);
        return;
      }

      const validationError = getSlotSelectionError(resolvedSlotStart, {
        allowMonthSelection: true,
      });

      if (validationError) {
        publish('error', validationError);
        return;
      }

      setSelectedSlotStart(resolvedSlotStart);
    },
    [
      getSlotSelectionError,
      isLoadingAvailability,
      isSubmitting,
      publish,
      resolveSlotStartByView,
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

  const eventPropGetter = useCallback((event: { status: AppointmentStatus }) => {
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
  }, []);

  const slotPropGetter = useCallback(
    (date: Date) => {
      if (!isValidCalendarDate(date)) {
        return {};
      }

      const isPast = date.getTime() <= Date.now();
      const isBusy = occupiedTimestampSet.has(date.getTime());
      const isUnavailable = !isWithinExamAvailability(
        date,
        slotStep,
        examAvailability,
      );
      const isSelected =
        selectedSlotStart !== null && selectedSlotStart.getTime() === date.getTime();

      if (!isPast && !isBusy && !isUnavailable) {
        return {
          className: isSelected ? 'ep-slot-available ep-slot-selected' : 'ep-slot-available',
        };
      }

      return {
        className: isBusy ? 'ep-slot-busy' : 'ep-slot-unavailable',
      };
    },
    [examAvailability, occupiedTimestampSet, selectedSlotStart, slotStep],
  );

  const dayPropGetter = useCallback(
    (date: Date) => {
      if (view !== Views.MONTH || !isValidCalendarDate(date)) {
        return {};
      }

      const meta = dayAvailabilityMap.get(getDayAvailabilityKey(date));
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

  const calendarComponents = useMemo(() => {
    return {
      month: {
        dateHeader: ({ date, label }: DateHeaderProps) => {
          if (!isValidCalendarDate(date)) {
            return createElement('div', { className: 'ep-month-date-header' }, label);
          }

          const meta = dayAvailabilityMap.get(getDayAvailabilityKey(date));
          const toneClass = meta?.tone ?? 'unavailable';

          return createElement(
            'div',
            { className: 'ep-month-date-header' },
            createElement(
              'button',
              {
                className: `ep-month-date-button ep-month-date-button-${toneClass}`,
                type: 'button',
                onClick: (event: { preventDefault: () => void; stopPropagation: () => void }) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleMonthDaySelection(date);
                },
              },
              label,
            ),
          );
        },
      },
    };
  }, [dayAvailabilityMap, handleMonthDaySelection]);

  const handleNavigate = useCallback((nextDate: Date) => {
    if (!isValidCalendarDate(nextDate)) {
      return;
    }

    setViewDate(nextDate);
  }, []);

  const handleView = useCallback((nextView: View) => {
    setView(nextView);
  }, []);

  const handleSelectEvent = useCallback(
    (event: { start: Date; status: AppointmentStatus }) => {
      if (!isValidCalendarDate(event.start)) {
        return;
      }

      publish(
        'error',
        `${toAppointmentStatusLabel(event.status)} em ${formatDateTime(event.start.toISOString())}. Escolha um horário disponível.`,
      );
    },
    [publish],
  );

  return {
    exam,
    examAvailability,
    isLoadingExam,
    isLoadingAvailability,
    isSubmitting,
    selectedSlotStart,
    slotStep,
    view,
    viewDate,
    availabilityEvents,
    calendarComponents,
    handleNavigate,
    handleView,
    handleSelecting,
    handleSelectSlot,
    handleSelectEvent,
    handleConfirmSchedule,
    eventPropGetter,
    slotPropGetter,
    dayPropGetter,
    setSelectedSlotStart,
  };
};
