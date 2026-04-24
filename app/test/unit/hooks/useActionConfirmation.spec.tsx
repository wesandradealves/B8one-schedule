import { act, renderHook } from '@testing-library/react';
import { useActionConfirmation } from '@/hooks/useActionConfirmation';

interface Item {
  id: string;
}

describe('useActionConfirmation', () => {
  it('should open and close confirmation state with target item', () => {
    const { result } = renderHook(() => useActionConfirmation<Item>());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.target).toBeNull();

    act(() => {
      result.current.openConfirmation({ id: 'item-1' });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.target).toEqual({ id: 'item-1' });

    act(() => {
      result.current.closeConfirmation();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.target).toBeNull();
  });
});
