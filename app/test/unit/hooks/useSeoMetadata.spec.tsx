import { renderHook } from '@testing-library/react';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { buildSeoMetadata } from '@/utils/seo';

jest.mock('@/utils/seo', () => ({
  buildSeoMetadata: jest.fn(() => ({ title: 'mocked' })),
}));

describe('useSeoMetadata', () => {
  it('should delegate to buildSeoMetadata with stable contract', () => {
    const input = {
      title: 'Exames',
      description: 'Lista',
      path: '/app/exams',
      indexable: true,
    };

    const { result } = renderHook(() => useSeoMetadata(input));

    expect(buildSeoMetadata).toHaveBeenCalledWith(input);
    expect(result.current).toEqual({ title: 'mocked' });
  });
});
