'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ExamNameIcon } from '@/components/atoms/exam-name-icon';
import type { Exam } from '@/types/exam';
import { APP_ROUTES } from '@/utils/route';
import { formatCurrencyFromCents } from '@/utils/format';

const CardRoot = styled.article.attrs({
  className: 'flex h-full flex-col gap-4 rounded-2xl border p-4',
})`
  border-color: var(--color-card-border);
  background: var(--color-card-surface);
  box-shadow: 0 10px 26px color-mix(in srgb, var(--color-brand-500) 8%, transparent);
`;

const CardHeader = styled.header.attrs({
  className: 'flex items-start gap-3',
})``;

const ExamTitle = styled.h3.attrs({
  className: 'text-base font-semibold leading-tight',
})`
  color: var(--color-text-primary);
`;

const ExamMeta = styled.p.attrs({
  className: 'mt-1 text-xs',
})`
  color: var(--color-text-secondary);
`;

const ExamDescription = styled.p.attrs({
  className: 'line-clamp-3 text-sm',
})`
  color: var(--color-text-secondary);
`;

const CardActions = styled.footer.attrs({
  className: 'mt-auto grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]',
})``;

const ViewDatesButton = styled(Link).attrs({
  className:
    'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border px-3 text-sm font-medium transition-colors',
})`
  border-color: var(--color-brand-100);
  color: var(--color-brand-700);
  background: color-mix(in srgb, var(--color-brand-50) 60%, var(--color-background));

  &:hover {
    background: var(--color-brand-50);
  }
`;

const ScheduleButton = styled(Link).attrs({
  className:
    'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl px-3 text-sm font-medium text-white transition-colors',
})`
  background: linear-gradient(
    120deg,
    var(--color-brand-500),
    color-mix(in srgb, var(--color-brand-700) 85%, var(--color-brand-500))
  );

  &:hover {
    filter: brightness(0.97);
  }
`;

interface ExamAvailableCardProps {
  exam: Exam;
}

export function ExamAvailableCard({ exam }: ExamAvailableCardProps) {
  const detailsRoute = APP_ROUTES.examDetails(exam.id);
  const description = exam.description?.trim() || 'Sem descrição disponível.';

  return (
    <CardRoot>
      <CardHeader>
        <ExamNameIcon examName={exam.name} />
        <div>
          <ExamTitle>{exam.name}</ExamTitle>
          <ExamMeta>
            {exam.durationMinutes} min • {formatCurrencyFromCents(exam.priceCents)}
          </ExamMeta>
        </div>
      </CardHeader>

      <ExamDescription>{description}</ExamDescription>

      <CardActions>
        <ViewDatesButton href={detailsRoute}>Ver datas disponíveis</ViewDatesButton>
        <ScheduleButton href={detailsRoute}>Agendar</ScheduleButton>
      </CardActions>
    </CardRoot>
  );
}
