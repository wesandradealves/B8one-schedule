'use client';

import styled from 'styled-components';
import type { AuthFlowMessage } from '@/types/auth';

interface AuthInlineMessageProps {
  message: AuthFlowMessage;
}

const levelClasses: Record<AuthFlowMessage['level'], string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
};

const levelAriaLive: Record<AuthFlowMessage['level'], 'polite' | 'assertive'> = {
  info: 'polite',
  success: 'polite',
  error: 'assertive',
};

const levelRole: Record<AuthFlowMessage['level'], 'status' | 'alert'> = {
  info: 'status',
  success: 'status',
  error: 'alert',
};

const MessageBox = styled.div.attrs<{ $level: AuthFlowMessage['level'] }>(({ $level }) => ({
  className: `rounded-xl border px-3 py-2 text-center text-sm ${levelClasses[$level]}`,
  role: levelRole[$level],
  'aria-live': levelAriaLive[$level],
}))``;

export function AuthInlineMessage({ message }: AuthInlineMessageProps) {
  return <MessageBox $level={message.level}>{message.text}</MessageBox>;
}
