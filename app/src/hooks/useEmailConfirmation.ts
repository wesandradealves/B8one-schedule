'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmailConfirmation } from '@/services/auth.service';
import { useFeedback } from '@/hooks/useFeedback';
import type { AuthFlowMessage } from '@/types/auth';
import { getAuthErrorMessage, normalizeAuthMessage } from '@/utils/auth-message';
import { APP_ROUTES } from '@/utils/route';

type EmailConfirmationStatus = 'loading' | 'success' | 'error';

const INITIAL_INFO_MESSAGE: AuthFlowMessage = {
  level: 'info',
  text: 'Validando link de confirmação...',
};

export function useEmailConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publish } = useFeedback();

  const [status, setStatus] = useState<EmailConfirmationStatus>('loading');
  const [message, setMessage] = useState<AuthFlowMessage>(INITIAL_INFO_MESSAGE);
  const processedTokenRef = useRef<string | null>(null);
  const token = useMemo(() => {
    return searchParams?.get('token')?.trim() ?? '';
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      const errorMessage = 'Link de confirmação inválido ou ausente.';
      setStatus('error');
      setMessage({ level: 'error', text: errorMessage });
      return;
    }

    if (processedTokenRef.current === token) {
      return;
    }

    processedTokenRef.current = token;

    let mounted = true;

    const confirmEmail = async () => {
      setStatus('loading');
      setMessage(INITIAL_INFO_MESSAGE);

      try {
        const response = await verifyEmailConfirmation({ token });
        if (!mounted) {
          return;
        }

        const successMessage = normalizeAuthMessage(
          response.message,
          'E-mail confirmado com sucesso. Conta ativada.',
        );

        setStatus('success');
        setMessage({ level: 'success', text: successMessage });
        publish('success', successMessage);
      } catch (error) {
        if (!mounted) {
          return;
        }

        const errorMessage = getAuthErrorMessage(
          error,
          'Não foi possível confirmar seu e-mail.',
        );

        setStatus('error');
        setMessage({ level: 'error', text: errorMessage });
        publish('error', errorMessage);
      }
    };

    void confirmEmail();

    return () => {
      mounted = false;
    };
  }, [publish, token]);

  const goToLogin = useCallback(() => {
    router.push(APP_ROUTES.login);
  }, [router]);

  const actionLabel = useMemo(() => {
    return status === 'success' ? 'Ir para login' : 'Voltar ao login';
  }, [status]);

  return {
    status,
    message,
    actionLabel,
    goToLogin,
  };
}
