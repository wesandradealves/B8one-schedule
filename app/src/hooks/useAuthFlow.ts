'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  login,
  requestPasswordRecovery,
  resetPassword,
  verifyPasswordRecoveryCode,
  verifyTwoFactor,
} from '@/services/auth.service';
import { APP_ROUTES, resolvePostLoginRoute } from '@/utils/route';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import {
  type AuthFlowFieldErrors,
  useAuthFlowStore,
} from '@/hooks/useAuthFlow.store';
import type { AuthFlowMessage, AuthFlowStep } from '@/types/auth';
import { getAuthErrorMessage, normalizeAuthMessage } from '@/utils/auth-message';

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidTwoFactorCode = (value: string): boolean => {
  return /^\d{6}$/.test(value);
};

const isValidPassword = (value: string): boolean => {
  return value.length >= 6 && value.length <= 128;
};

const trimAndNormalizeEmail = (value: string): string => {
  return value.trim().toLowerCase();
};

const DEFAULT_TWO_FACTOR_EXPIRATION_SECONDS = 600;

const normalizeTwoFactorExpirationSeconds = (value: number | undefined): number => {
  if (typeof value !== 'number') {
    return DEFAULT_TWO_FACTOR_EXPIRATION_SECONDS;
  }

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_TWO_FACTOR_EXPIRATION_SECONDS;
  }

  return Math.floor(value);
};

const buildCredentialsErrors = (email: string, password: string): AuthFlowFieldErrors => {
  const errors: AuthFlowFieldErrors = {};

  if (!isValidEmail(email)) {
    errors.email = 'Informe um e-mail valido';
  }

  if (!isValidPassword(password)) {
    errors.password = 'A senha deve ter entre 6 e 128 caracteres';
  }

  return errors;
};

const buildCodeErrors = (code: string): AuthFlowFieldErrors => {
  const errors: AuthFlowFieldErrors = {};

  if (!isValidTwoFactorCode(code)) {
    errors.code = 'O codigo deve conter exatamente 6 digitos';
  }

  return errors;
};

const buildResetErrors = (
  code: string,
  newPassword: string,
  confirmNewPassword: string,
): AuthFlowFieldErrors => {
  const errors: AuthFlowFieldErrors = buildCodeErrors(code);

  if (!isValidPassword(newPassword)) {
    errors.newPassword = 'A senha deve ter entre 6 e 128 caracteres';
  }

  if (newPassword !== confirmNewPassword) {
    errors.confirmNewPassword = 'As senhas nao conferem';
  }

  return errors;
};

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { publish } = useFeedback();

  const mode = useAuthFlowStore((state) => state.mode);
  const step = useAuthFlowStore((state) => state.step);
  const form = useAuthFlowStore((state) => state.form);
  const twoFactorExpiresInSeconds = useAuthFlowStore(
    (state) => state.twoFactorExpiresInSeconds,
  );
  const fieldErrors = useAuthFlowStore((state) => state.fieldErrors);
  const message = useAuthFlowStore((state) => state.message);
  const isSubmitting = useAuthFlowStore((state) => state.isSubmitting);
  const setStep = useAuthFlowStore((state) => state.setStep);
  const setMode = useAuthFlowStore((state) => state.setMode);
  const setField = useAuthFlowStore((state) => state.setField);
  const setForm = useAuthFlowStore((state) => state.setForm);
  const setFieldErrors = useAuthFlowStore((state) => state.setFieldErrors);
  const setTwoFactorExpiresInSeconds = useAuthFlowStore(
    (state) => state.setTwoFactorExpiresInSeconds,
  );
  const clearFieldErrors = useAuthFlowStore((state) => state.clearFieldErrors);
  const setMessage = useAuthFlowStore((state) => state.setMessage);
  const setSubmitting = useAuthFlowStore((state) => state.setSubmitting);
  const resetState = useAuthFlowStore((state) => state.resetState);

  useEffect(() => {
    resetState();
  }, [resetState]);

  const clearAuthFlowSecrets = useCallback(() => {
    setForm({
      password: '',
      code: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }, [setForm]);

  const transitionStep = useCallback(
    ({
      step: nextStep,
      mode: nextMode,
      formPatch,
      clearErrors = true,
      clearMessage = false,
      message: nextMessage,
    }: {
      step: AuthFlowStep;
      mode?: 'login' | 'recovery';
      formPatch?: Partial<typeof form>;
      clearErrors?: boolean;
      clearMessage?: boolean;
      message?: AuthFlowMessage | null;
    }) => {
      if (nextMode) {
        setMode(nextMode);
      }

      setStep(nextStep);

      if (clearErrors) {
        clearFieldErrors();
      }

      if (clearMessage) {
        setMessage(null);
      }

      if (nextMessage !== undefined) {
        setMessage(nextMessage);
      }

      if (formPatch) {
        setForm(formPatch);
      }
    },
    [clearFieldErrors, setForm, setMessage, setMode, setStep],
  );

  const publishStepError = useCallback(
    (errorMessage: string) => {
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
    },
    [publish, setMessage],
  );

  const switchToRecovery = useCallback(() => {
    clearAuthFlowSecrets();
    transitionStep({
      mode: 'recovery',
      step: 'recovery-email',
      clearMessage: true,
    });
  }, [clearAuthFlowSecrets, transitionStep]);

  const goToLogin = useCallback(() => {
    clearAuthFlowSecrets();
    transitionStep({
      mode: 'login',
      step: 'login-credentials',
      clearMessage: true,
    });
  }, [clearAuthFlowSecrets, transitionStep]);

  const goBack = useCallback(() => {
    if (step === 'login-two-factor') {
      transitionStep({
        step: 'login-credentials',
        clearMessage: true,
        formPatch: { code: '' },
      });
      return;
    }

    if (step === 'recovery-email') {
      goToLogin();
      return;
    }

    if (step === 'recovery-two-factor') {
      transitionStep({
        step: 'recovery-email',
        clearMessage: true,
        formPatch: { code: '' },
      });
      return;
    }

    if (step === 'recovery-reset') {
      transitionStep({
        step: 'recovery-two-factor',
        clearMessage: true,
        formPatch: {
          newPassword: '',
          confirmNewPassword: '',
        },
      });
      return;
    }

    if (step === 'recovery-result') {
      transitionStep({
        step: 'recovery-reset',
      });
    }
  }, [goToLogin, step, transitionStep]);

  const submitLoginCredentials = useCallback(async () => {
    const email = trimAndNormalizeEmail(form.email);
    const password = form.password;
    const errors = buildCredentialsErrors(email, password);

    setFieldErrors(errors);
    setMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await login({ email, password });
      const nextTwoFactorExpiration = normalizeTwoFactorExpirationSeconds(
        response.twoFactorExpiresInSeconds,
      );
      setTwoFactorExpiresInSeconds(nextTwoFactorExpiration);

      transitionStep({
        mode: 'login',
        step: 'login-two-factor',
        formPatch: { email, code: '' },
        message: {
          level: 'info',
          text: normalizeAuthMessage(
            response.message,
            'Código 2FA enviado para seu e-mail.',
          ),
        },
      });
    } catch (error) {
      publishStepError(
        getAuthErrorMessage(error, 'Falha ao iniciar autenticação'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form.email,
    form.password,
    publishStepError,
    setFieldErrors,
    setMessage,
    setSubmitting,
    setTwoFactorExpiresInSeconds,
    transitionStep,
  ]);

  const submitLoginTwoFactor = useCallback(async () => {
    const email = trimAndNormalizeEmail(form.email);
    const code = form.code.trim();
    const errors = buildCodeErrors(code);

    setFieldErrors(errors);
    setMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await verifyTwoFactor({ email, code });
      setSession(response.accessToken);

      const nextRoute = searchParams?.get('next') ?? null;
      const targetRoute = resolvePostLoginRoute(nextRoute);
      router.replace(targetRoute);
    } catch (error) {
      publishStepError(
        getAuthErrorMessage(error, 'Falha ao validar código 2FA'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form.code,
    form.email,
    publishStepError,
    router,
    searchParams,
    setFieldErrors,
    setMessage,
    setSession,
    setSubmitting,
  ]);

  const submitRecoveryEmail = useCallback(async () => {
    const email = trimAndNormalizeEmail(form.email);
    const errors: AuthFlowFieldErrors = {};

    if (!isValidEmail(email)) {
      errors.email = 'Informe um e-mail valido';
    }

    setFieldErrors(errors);
    setMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await requestPasswordRecovery({ email });
      const nextTwoFactorExpiration = normalizeTwoFactorExpirationSeconds(
        response.twoFactorExpiresInSeconds,
      );
      setTwoFactorExpiresInSeconds(nextTwoFactorExpiration);

      transitionStep({
        mode: 'recovery',
        step: 'recovery-two-factor',
        formPatch: { email, code: '' },
        message: {
          level: 'info',
          text: normalizeAuthMessage(
            response.message,
            'Se o e-mail existir, um código de verificação foi enviado.',
          ),
        },
      });
    } catch (error) {
      publishStepError(
        getAuthErrorMessage(error, 'Falha ao iniciar recuperação de senha'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form.email,
    publishStepError,
    setFieldErrors,
    setMessage,
    setSubmitting,
    setTwoFactorExpiresInSeconds,
    transitionStep,
  ]);

  const submitRecoveryTwoFactor = useCallback(async () => {
    const email = trimAndNormalizeEmail(form.email);
    const code = form.code.trim();
    const errors = buildCodeErrors(code);

    setFieldErrors(errors);
    setMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await verifyPasswordRecoveryCode({ email, code });

      transitionStep({
        step: 'recovery-reset',
        message: {
          level: 'success',
          text: normalizeAuthMessage(
            response.message,
            'Código de verificação validado com sucesso.',
          ),
        },
      });
    } catch (error) {
      publishStepError(
        getAuthErrorMessage(error, 'Falha ao validar código de recuperação'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form.code,
    form.email,
    publishStepError,
    setFieldErrors,
    setMessage,
    setSubmitting,
    transitionStep,
  ]);

  const submitRecoveryReset = useCallback(async () => {
    const email = trimAndNormalizeEmail(form.email);
    const code = form.code.trim();
    const newPassword = form.newPassword;
    const confirmNewPassword = form.confirmNewPassword;
    const errors = buildResetErrors(code, newPassword, confirmNewPassword);

    setFieldErrors(errors);
    setMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await resetPassword({ email, code, newPassword });

      transitionStep({
        step: 'recovery-result',
        message: {
          level: 'success',
          text: normalizeAuthMessage(
            response.message,
            'Senha atualizada com sucesso.',
          ),
        },
        formPatch: {
          password: '',
          newPassword: '',
          confirmNewPassword: '',
        },
      });
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, 'Falha ao redefinir senha');
      transitionStep({
        step: 'recovery-result',
        message: { level: 'error', text: errorMessage },
      });
      publish('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    form.code,
    form.confirmNewPassword,
    form.email,
    form.newPassword,
    publish,
    setFieldErrors,
    setMessage,
    setSubmitting,
    transitionStep,
  ]);

  const submitCurrentStep = useCallback(async () => {
    const stepHandlers: Record<AuthFlowStep, () => Promise<void>> = {
      'login-credentials': submitLoginCredentials,
      'login-two-factor': submitLoginTwoFactor,
      'recovery-email': submitRecoveryEmail,
      'recovery-two-factor': submitRecoveryTwoFactor,
      'recovery-reset': submitRecoveryReset,
      'recovery-result': async () => {
        goToLogin();
        router.replace(APP_ROUTES.login);
      },
    };

    await stepHandlers[step]();
  }, [
    goToLogin,
    router,
    step,
    submitLoginCredentials,
    submitLoginTwoFactor,
    submitRecoveryEmail,
    submitRecoveryReset,
    submitRecoveryTwoFactor,
  ]);

  return {
    mode,
    step,
    form,
    fieldErrors,
    message,
    isSubmitting,
    twoFactorExpiresInSeconds,
    setField,
    switchToRecovery,
    goToLogin,
    goBack,
    submitCurrentStep,
  };
}
