'use client';

import styled from 'styled-components';
import { Calendar, Views } from 'react-big-calendar';
import { ActionConfirmDialog } from '@/components/molecules/action-confirm-dialog';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { useExamSchedulingCalendar } from '@/hooks/useExamSchedulingCalendar';
import type { AppointmentStatus } from '@/types/appointment';
import {
  EXAM_CALENDAR_LOCALIZER,
  EXAM_CALENDAR_MESSAGES,
  EXAM_CALENDAR_VIEWS,
} from '@/utils/exam-scheduling-calendar';
import { getWeekdaySummary } from '@/utils/exam-availability';
import { formatDateTime } from '@/utils/format';

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
    background-color: var(--color-slot-available-bg) !important;
    cursor: pointer !important;
  }

  .ep-slot-available::after {
    content: 'LIVRE';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    color: var(--color-slot-available-fg);
    pointer-events: none;
  }

  .ep-slot-available:hover {
    background-color: var(--color-slot-available-bg-hover) !important;
    box-shadow: inset 0 0 0 1px var(--color-slot-available-outline);
  }

  .ep-slot-selected {
    background-color: var(--color-slot-available-bg-selected) !important;
    box-shadow: inset 0 0 0 2px var(--color-slot-available-outline);
  }

  .ep-slot-busy {
    background-color: var(--color-slot-busy-bg) !important;
    background-image: repeating-linear-gradient(
      45deg,
      var(--color-slot-busy-stripe-strong),
      var(--color-slot-busy-stripe-strong) 6px,
      var(--color-slot-busy-stripe-soft) 6px,
      var(--color-slot-busy-stripe-soft) 12px
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
    color: var(--color-slot-busy-fg);
    pointer-events: none;
  }

  .ep-slot-unavailable {
    background-color: var(--color-slot-unavailable-bg) !important;
    cursor: not-allowed !important;
  }

  .ep-slot-unavailable::after {
    content: 'INDISP.';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 9px;
    font-weight: 700;
    color: var(--color-slot-unavailable-fg);
    pointer-events: none;
  }

  .ep-month-day-available {
    background: var(--color-slot-available-bg);
    cursor: pointer;
  }

  .ep-month-day-busy {
    background: var(--color-slot-busy-bg);
    cursor: not-allowed;
  }

  .ep-month-day-unavailable {
    background: var(--color-slot-unavailable-bg);
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
    background: var(--color-slot-available-bg);
    color: var(--color-slot-available-fg);
  }

  .ep-month-day-busy::after {
    content: 'RESERVADO';
    background: var(--color-slot-busy-bg);
    color: var(--color-slot-busy-fg);
  }

  .ep-month-day-unavailable::after {
    content: 'INDISP.';
    background: var(--color-slot-unavailable-bg);
    color: var(--color-slot-unavailable-fg);
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
    background: var(--color-calendar-focus-hover);
  }

  .ep-month-date-button:focus-visible {
    outline: 2px solid var(--color-calendar-focus-ring);
    outline-offset: 1px;
  }

  .ep-month-date-button-available {
    color: var(--color-slot-available-fg);
  }

  .ep-month-date-button-busy {
    color: var(--color-slot-busy-fg);
  }

  .ep-month-date-button-unavailable {
    color: var(--color-slot-unavailable-fg);
  }
`;

const SummaryRow = styled.div.attrs({
  className: 'mt-2 flex flex-wrap items-center gap-2 text-sm',
})`
  color: var(--color-text-secondary);
`;

const LegendBadge = styled.span.attrs({
  className: 'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
})<{ $status: AppointmentStatus }>`
  background: ${({ $status }) =>
    $status === 'PENDING'
      ? 'var(--color-status-pending-bg)'
      : $status === 'SCHEDULED'
        ? 'var(--color-status-scheduled-bg)'
        : 'var(--color-status-cancelled-bg)'};
  color: ${({ $status }) =>
    $status === 'PENDING'
      ? 'var(--color-status-pending-fg)'
      : $status === 'SCHEDULED'
        ? 'var(--color-status-scheduled-fg)'
        : 'var(--color-status-cancelled-fg)'};
`;

const SlotLegendBadge = styled.span.attrs({
  className: 'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
})<{ $kind: 'available' | 'blocked' }>`
  background: ${({ $kind }) =>
    $kind === 'available'
      ? 'var(--color-slot-available-bg)'
      : 'var(--color-slot-unavailable-bg)'};
  color: ${({ $kind }) =>
    $kind === 'available'
      ? 'var(--color-slot-available-fg)'
      : 'var(--color-slot-unavailable-fg)'};
`;

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

interface ExamSchedulingCalendarSectionProps {
  examId: string;
}

export function ExamSchedulingCalendarSection({ examId }: ExamSchedulingCalendarSectionProps) {
  const {
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
  } = useExamSchedulingCalendar({ examId });

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
        Selecione um horário livre para solicitar seu agendamento. Pedidos de cliente entram
        com status pendente de aprovação.
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
          <span>reservado, passado ou fora da disponibilidade</span>
        </SummaryRow>
        <SummaryRow>
          <span>Duração: {exam.durationMinutes} minutos</span>
          <span>•</span>
          <span>
            Horário: {examAvailability.availableStartTime} às {examAvailability.availableEndTime}
          </span>
          <span>•</span>
          <span>Dias: {getWeekdaySummary(examAvailability.availableWeekdays) || '-'}</span>
          {examAvailability.availableFromDate || examAvailability.availableToDate ? (
            <>
              <span>•</span>
              <span>
                Período:{' '}
                {`${examAvailability.availableFromDate ?? 'sem início'} até ${examAvailability.availableToDate ?? 'sem fim'}`}
              </span>
            </>
          ) : null}
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
            localizer={EXAM_CALENDAR_LOCALIZER}
            max={new Date(1970, 1, 1, 19, 0, 0)}
            min={new Date(1970, 1, 1, 7, 0, 0)}
            messages={EXAM_CALENDAR_MESSAGES}
            selectable="ignoreEvents"
            slotPropGetter={slotPropGetter}
            startAccessor="start"
            step={slotStep}
            timeslots={1}
            view={view}
            views={EXAM_CALENDAR_VIEWS}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onSelecting={handleSelecting}
            onView={handleView}
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
