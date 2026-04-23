'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type FeedbackLevel = 'success' | 'error' | 'info' | 'warning';

export interface FeedbackMessage {
  id: string;
  level: FeedbackLevel;
  message: string;
}

interface FeedbackContextValue {
  messages: FeedbackMessage[];
  publish: (level: FeedbackLevel, message: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const createMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const publish = useCallback((level: FeedbackLevel, message: string): string => {
    const id = createMessageId();

    setMessages((previous) => {
      return [...previous, { id, level, message }];
    });

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setMessages((previous) => previous.filter((message) => message.id !== id));
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo<FeedbackContextValue>(() => {
    return {
      messages,
      publish,
      dismiss,
      clear,
    };
  }, [clear, dismiss, messages, publish]);

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedbackContext(): FeedbackContextValue {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedbackContext must be used within FeedbackProvider');
  }

  return context;
}
