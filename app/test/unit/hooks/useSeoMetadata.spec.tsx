import { renderHook } from '@testing-library/react';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { buildSeoMetadata } from '@/utils/seo';

jest.mock('@/utils/seo', () => ({
  buildSeoMetadata: jest.fn(() => ({
    title: 'mocked',
    description: 'meta description',
  })),
}));

describe('useSeoMetadata', () => {
  beforeEach(() => {
    document.title = 'Initial';
    document.querySelector('meta[name=\"description\"]')?.remove();
    jest.clearAllMocks();
  });

  it('should delegate to buildSeoMetadata with stable contract', () => {
    const input = {
      title: 'Exames',
      description: 'Lista',
      path: '/app/exams',
      indexable: true,
    };

    const { result } = renderHook(() => useSeoMetadata(input));

    expect(buildSeoMetadata).toHaveBeenCalledWith(input);
    expect(result.current).toEqual({
      title: 'mocked',
      description: 'meta description',
    });
    expect(document.title).toBe('mocked');
    expect(
      document
        .querySelector('meta[name=\"description\"]')
        ?.getAttribute('content'),
    ).toBe('meta description');
  });

  it('should not mutate document description when metadata description is not a string', () => {
    (buildSeoMetadata as jest.Mock).mockReturnValueOnce({
      title: { absolute: 'Titulo não-string' },
      description: undefined,
    });

    renderHook(() =>
      useSeoMetadata({
        title: 'Exames',
        description: 'Lista',
        path: '/app/exams',
        indexable: false,
      }),
    );

    expect(document.title).toBe('Initial');
    expect(document.querySelector('meta[name="description"]')).not.toBeInTheDocument();
  });
});
