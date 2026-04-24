'use client';

import { useEffect, useMemo, useState } from 'react';

interface UseOtpCountdownInput {
  isActive: boolean;
  durationSeconds: number;
  resetKey: string;
}

const formatSeconds = (value: number): string => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useOtpCountdown = ({
  isActive,
  durationSeconds,
  resetKey,
}: UseOtpCountdownInput) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  useEffect(() => {
    setRemainingSeconds(durationSeconds);

    if (!isActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 0) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [durationSeconds, isActive, resetKey]);

  const formattedRemaining = useMemo(() => {
    return formatSeconds(remainingSeconds);
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    formattedRemaining,
    isExpired: remainingSeconds <= 0,
  };
};
