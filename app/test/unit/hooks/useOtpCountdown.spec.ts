import { act, renderHook } from '@testing-library/react';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';

describe('useOtpCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should decrement countdown while active and stop at zero', () => {
    const { result } = renderHook(() =>
      useOtpCountdown({
        isActive: true,
        durationSeconds: 3,
        resetKey: 'login-two-factor',
      }),
    );

    expect(result.current.formattedRemaining).toBe('00:03');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.formattedRemaining).toBe('00:02');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.formattedRemaining).toBe('00:00');
    expect(result.current.isExpired).toBe(true);
  });

  it('should reset countdown when reset key changes', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) =>
        useOtpCountdown({
          isActive: true,
          durationSeconds: 5,
          resetKey,
        }),
      {
        initialProps: { resetKey: 'login-two-factor' },
      },
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.formattedRemaining).toBe('00:03');

    rerender({ resetKey: 'recovery-two-factor' });
    expect(result.current.formattedRemaining).toBe('00:05');
  });
});
