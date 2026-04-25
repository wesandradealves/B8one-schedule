'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Exam } from '@/types/exam';
import { listExams } from '@/services/exams.service';
import { useFeedback } from '@/hooks/useFeedback';
import { getRequestErrorMessage } from '@/utils/request';

const EXAMS_PAGE_LIMIT = 6;

interface UseClientHomeExamsOptions {
  enabled: boolean;
}

export const useClientHomeExams = ({ enabled }: UseClientHomeExamsOptions) => {
  const { publish } = useFeedback();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const isLoadMoreInFlightRef = useRef(false);

  const fetchExamsPage = useCallback(
    async (page: number, append: boolean) => {
      const result = await listExams({
        page,
        limit: EXAMS_PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      const totalPages = Math.max(1, result.totalPages ?? 1);

      setExams((currentExams) =>
        append ? [...currentExams, ...result.data] : result.data,
      );
      setCurrentPage(page);
      setHasMore(page < totalPages);
    },
    [],
  );

  const fetchExams = useCallback(async () => {
    if (!enabled) {
      setExams([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      await fetchExamsPage(1, false);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
      setExams([]);
      setCurrentPage(1);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetchExamsPage, publish]);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      isLoading ||
      isLoadingMore ||
      !hasMore ||
      isLoadMoreInFlightRef.current
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    isLoadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    try {
      await fetchExamsPage(nextPage, true);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsLoadingMore(false);
      isLoadMoreInFlightRef.current = false;
    }
  }, [
    currentPage,
    enabled,
    fetchExamsPage,
    hasMore,
    isLoading,
    isLoadingMore,
    publish,
  ]);

  return {
    exams,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
};
