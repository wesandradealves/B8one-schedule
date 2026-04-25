import { act, renderHook, waitFor } from '@testing-library/react';
import { useClientHomeExams } from '@/hooks/useClientHomeExams';
import { listExams } from '@/services/exams.service';

const publishMock = jest.fn();

jest.mock('@/services/exams.service', () => ({
  listExams: jest.fn(),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

describe('useClientHomeExams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches exams when enabled', async () => {
    (listExams as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: null,
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      totalPages: 1,
    });

    const { result } = renderHook(() => useClientHomeExams({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listExams).toHaveBeenCalledWith({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    expect(result.current.exams).toHaveLength(1);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('does not fetch exams when disabled', async () => {
    const { result } = renderHook(() => useClientHomeExams({ enabled: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listExams).not.toHaveBeenCalled();
    expect(result.current.exams).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('loads more exams when there are additional pages', async () => {
    (listExams as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'exam-1',
            name: 'Hemograma',
            description: null,
            durationMinutes: 30,
            priceCents: 10000,
          },
        ],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'exam-2',
            name: 'Glicemia',
            description: null,
            durationMinutes: 20,
            priceCents: 8000,
          },
        ],
        totalPages: 2,
      });

    const { result } = renderHook(() => useClientHomeExams({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.exams).toHaveLength(2);
    });

    expect(listExams).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    expect(listExams).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    expect(result.current.hasMore).toBe(false);
  });
});
