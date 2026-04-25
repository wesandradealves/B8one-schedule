'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { ExamAvailableCard } from '@/components/molecules/exam-available-card';
import { useAuth } from '@/hooks/useAuth';
import { useClientHomeExams } from '@/hooks/useClientHomeExams';

const EXAMS_BATCH_SIZE = 6;

const CardsGrid = styled.section.attrs({
  className: 'mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
  'aria-live': 'polite',
})``;

const EmptyCard = styled.div.attrs({
  className: 'mt-6 rounded-2xl border px-4 py-8 text-center text-sm',
})`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-background);
`;

const LoadingCard = styled.div.attrs({
  className: 'h-44 animate-pulse rounded-2xl border',
  'data-testid': 'exam-loading-card',
})`
  border-color: var(--color-card-border);
  background: color-mix(in srgb, var(--color-brand-50) 45%, var(--color-background));
`;

const InfiniteScrollTrigger = styled.div.attrs({
  className: 'h-1 w-full',
  'aria-hidden': 'true',
})``;

export function ClientHomeExamsSection() {
  const { user } = useAuth();
  const isClient = user?.profile === 'CLIENT';
  const { exams, isLoading, isLoadingMore, hasMore, loadMore } = useClientHomeExams({
    enabled: isClient,
  });
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [hasScrollIntent, setHasScrollIntent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || hasScrollIntent) {
      return;
    }

    const markScrollIntent = () => {
      setHasScrollIntent(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['PageDown', 'ArrowDown', 'End', ' '].includes(event.key)) {
        return;
      }

      markScrollIntent();
    };

    window.addEventListener('scroll', markScrollIntent, { passive: true });
    window.addEventListener('wheel', markScrollIntent, { passive: true });
    window.addEventListener('touchmove', markScrollIntent, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', markScrollIntent);
      window.removeEventListener('wheel', markScrollIntent);
      window.removeEventListener('touchmove', markScrollIntent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasScrollIntent]);

  useEffect(() => {
    if (
      !hasScrollIntent ||
      isLoading ||
      isLoadingMore ||
      !hasMore ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const triggerElement = loadMoreTriggerRef.current;
    if (!triggerElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        void loadMore();
      },
      {
        rootMargin: '260px 0px',
        threshold: 0,
      },
    );

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, hasScrollIntent, isLoading, isLoadingMore, loadMore]);

  if (!isClient) {
    return (
      <PageContainer>
        <PageTitle>Área autenticada</PageTitle>
        <PageDescription>Espaço reservado para o conteúdo principal da dashboard.</PageDescription>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Exames disponíveis</PageTitle>
      <PageDescription>
        Escolha um exame, consulte os horários livres e envie seu pedido de agendamento.
      </PageDescription>

      {isLoading ? (
        <CardsGrid>
          {Array.from({ length: EXAMS_BATCH_SIZE }).map((_, index) => (
            <LoadingCard key={`loading-initial-${index}`} />
          ))}
        </CardsGrid>
      ) : null}

      {!isLoading && exams.length === 0 ? (
        <EmptyCard>Nenhum exame disponível no momento.</EmptyCard>
      ) : null}

      {!isLoading && exams.length > 0 ? (
        <>
          <CardsGrid>
            {exams.map((exam) => (
              <ExamAvailableCard key={exam.id} exam={exam} />
            ))}
            {isLoadingMore
              ? Array.from({ length: EXAMS_BATCH_SIZE }).map((_, index) => (
                  <LoadingCard key={`loading-more-${index}`} />
                ))
              : null}
          </CardsGrid>
          {hasMore ? <InfiniteScrollTrigger ref={loadMoreTriggerRef} /> : null}
        </>
      ) : null}
    </PageContainer>
  );
}
