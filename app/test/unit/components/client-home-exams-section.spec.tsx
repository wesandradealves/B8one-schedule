import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ClientHomeExamsSection } from '@/components/organisms/protected/client-home-exams-section';

const useAuthMock = jest.fn();
const useClientHomeExamsMock = jest.fn();
const observeMock = jest.fn();
const disconnectMock = jest.fn();
let intersectionCallback:
  | ((entries: Array<{ isIntersecting: boolean }>) => void)
  | null = null;
const originalIntersectionObserver = global.IntersectionObserver;

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('@/hooks/useClientHomeExams', () => ({
  useClientHomeExams: (options: { enabled: boolean }) => useClientHomeExamsMock(options),
}));

jest.mock('@/components/molecules/exam-available-card', () => ({
  __esModule: true,
  ExamAvailableCard: ({ exam }: { exam: { name: string } }) => <div>{exam.name}</div>,
}));

describe('ClientHomeExamsSection', () => {
  const createClientHomeExamsState = (overrides?: Record<string, unknown>) => ({
    exams: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    loadMore: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    observeMock.mockReset();
    disconnectMock.mockReset();
    intersectionCallback = null;

    global.IntersectionObserver = jest
      .fn()
      .mockImplementation(
        (callback: (entries: Array<{ isIntersecting: boolean }>) => void) => {
          intersectionCallback = callback;

          return {
            observe: observeMock,
            disconnect: disconnectMock,
            unobserve: jest.fn(),
            takeRecords: jest.fn(),
          };
        },
      ) as unknown as typeof IntersectionObserver;
  });

  afterAll(() => {
    global.IntersectionObserver = originalIntersectionObserver;
  });

  it('renders default authenticated placeholder for admin', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        profile: 'ADMIN',
      },
    });
    useClientHomeExamsMock.mockReturnValue(createClientHomeExamsState());

    render(<ClientHomeExamsSection />);

    expect(screen.getByText('Área autenticada')).toBeInTheDocument();
  });

  it('renders loading state for client', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        profile: 'CLIENT',
      },
    });
    useClientHomeExamsMock.mockReturnValue(createClientHomeExamsState({ isLoading: true }));

    render(<ClientHomeExamsSection />);

    expect(screen.getByText('Exames disponíveis')).toBeInTheDocument();
    expect(screen.getAllByTestId('exam-loading-card')).toHaveLength(6);
  });

  it('renders exam cards for client', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        profile: 'CLIENT',
      },
    });
    useClientHomeExamsMock.mockReturnValue(createClientHomeExamsState({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: null,
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
    }));

    render(<ClientHomeExamsSection />);

    expect(screen.getByText('Hemograma')).toBeInTheDocument();
  });

  it('only starts infinite scroll after user scroll intent', async () => {
    const loadMore = jest.fn();

    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        profile: 'CLIENT',
      },
    });
    useClientHomeExamsMock.mockReturnValue(createClientHomeExamsState({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: null,
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      hasMore: true,
      loadMore,
    }));

    render(<ClientHomeExamsSection />);

    expect(observeMock).not.toHaveBeenCalled();
    expect(loadMore).not.toHaveBeenCalled();

    fireEvent.wheel(window);

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledTimes(1);
    });

    intersectionCallback?.([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalledTimes(1);
    });
  });
});
