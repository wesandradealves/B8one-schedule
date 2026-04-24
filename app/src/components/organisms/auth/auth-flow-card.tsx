'use client';

import { useCallback, useMemo, type ChangeEvent, type FormEvent } from 'react';
import styled from 'styled-components';
import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';
import { AuthLinkButton } from '@/components/atoms/auth-link-button';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';
import { AuthFormField } from '@/components/molecules/auth-form-field';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';
import { AuthOtpField } from '@/components/molecules/auth-otp-field';
import { AuthStepHeader } from '@/components/molecules/auth-step-header';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { APP_ROUTES } from '@/utils/route';
import type { AuthFlowField, AuthFlowStep } from '@/types/auth';

const AuthCard = styled.section.attrs({
  className: 'mx-auto flex w-full max-w-sm flex-col gap-6 py-10',
})``;

const ActionsStack = styled.div.attrs({
  className: 'flex flex-col gap-3',
})``;

const InlineActions = styled.div.attrs({
  className: 'flex items-center justify-start gap-2 text-sm',
})``;

const authStepCopyMap: Record<AuthFlowStep, { title: string; description: string }> = {
  'login-credentials': {
    title: 'Entrar na conta',
    description: 'Acesse sua conta para gerenciar exames e agendamentos.',
  },
  'login-two-factor': {
    title: 'Confirme o 2FA',
    description: 'Digite o codigo de 6 digitos enviado para seu e-mail.',
  },
  'recovery-email': {
    title: 'Recuperar senha',
    description: 'Informe seu e-mail para iniciar o fluxo de recuperacao.',
  },
  'recovery-two-factor': {
    title: 'Validar codigo',
    description: 'Digite o codigo recebido para continuar.',
  },
  'recovery-reset': {
    title: 'Nova senha',
    description: 'Defina e confirme sua nova senha.',
  },
  'recovery-result': {
    title: 'Recuperacao finalizada',
    description: 'Confira o resultado e volte para o login.',
  },
};

const authSubmitLabelMap: Record<AuthFlowStep, string> = {
  'login-credentials': 'Entrar',
  'login-two-factor': 'Validar codigo',
  'recovery-email': 'Enviar codigo',
  'recovery-two-factor': 'Confirmar codigo',
  'recovery-reset': 'Redefinir senha',
  'recovery-result': 'Voltar para login',
};

export function AuthFlowCard() {
  const {
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
  } = useAuthFlow();

  const { title, description } = useMemo(() => authStepCopyMap[step], [step]);
  const isOtpStep = useMemo(
    () => step === 'login-two-factor' || step === 'recovery-two-factor',
    [step],
  );
  const otpResetKey = useMemo(
    () => `${step}-${twoFactorExpiresInSeconds}-${form.email}`,
    [form.email, step, twoFactorExpiresInSeconds],
  );

  const otpCountdown = useOtpCountdown({
    isActive: isOtpStep,
    durationSeconds: twoFactorExpiresInSeconds,
    resetKey: otpResetKey,
  });

  useSeoMetadata({
    title,
    description,
    path: APP_ROUTES.login,
    indexable: false,
  });

  const canGoBack = useMemo(
    () => step !== 'login-credentials' && step !== 'recovery-result',
    [step],
  );
  const isRecoveryResultStep = useMemo(() => step === 'recovery-result', [step]);
  const submitLabel = useMemo(() => authSubmitLabelMap[step], [step]);

  const createInputChangeHandler = useCallback(
    (field: AuthFlowField) => {
      return (event: ChangeEvent<HTMLInputElement>) => {
        setField(field, event.target.value);
      };
    },
    [setField],
  );

  const onEmailChange = useMemo(() => createInputChangeHandler('email'), [createInputChangeHandler]);
  const onPasswordChange = useMemo(
    () => createInputChangeHandler('password'),
    [createInputChangeHandler],
  );
  const onNewPasswordChange = useMemo(
    () => createInputChangeHandler('newPassword'),
    [createInputChangeHandler],
  );
  const onConfirmNewPasswordChange = useMemo(
    () => createInputChangeHandler('confirmNewPassword'),
    [createInputChangeHandler],
  );

  const onCodeChange = useCallback(
    (nextCode: string) => {
      setField('code', nextCode);
    },
    [setField],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submitCurrentStep();
    },
    [submitCurrentStep],
  );

  return (
    <AuthCard>
      <div className="flex justify-center">
        <AuthBrandLogo tone="primary" size="lg" />
      </div>

      <AuthStepHeader title={title} description={description} />

      {message ? <AuthInlineMessage message={message} /> : null}

      <form
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        {step === 'login-credentials' ? (
          <>
            <AuthFormField
              name="email"
              label="Email"
              leftIcon="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={form.email}
              error={fieldErrors.email}
              disabled={isSubmitting}
              onChange={onEmailChange}
            />
            <AuthFormField
              name="password"
              label="Senha"
              leftIcon="password"
              type="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              value={form.password}
              error={fieldErrors.password}
              disabled={isSubmitting}
              onChange={onPasswordChange}
            />
          </>
        ) : null}

        {isOtpStep ? (
          <AuthOtpField
            label="Verificacao por codigo"
            value={form.code}
            error={fieldErrors.code}
            disabled={isSubmitting}
            countdownLabel="Codigo expira em"
            countdownValue={otpCountdown.formattedRemaining}
            onChange={onCodeChange}
          />
        ) : null}

        {step === 'recovery-email' ? (
          <AuthFormField
            name="email"
            label="Email"
            leftIcon="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={form.email}
            error={fieldErrors.email}
            disabled={isSubmitting}
            onChange={onEmailChange}
          />
        ) : null}

        {step === 'recovery-reset' ? (
          <>
            <AuthFormField
              name="newPassword"
              label="Nova senha"
              leftIcon="password"
              type="password"
              placeholder="Nova senha"
              autoComplete="new-password"
              value={form.newPassword}
              error={fieldErrors.newPassword}
              disabled={isSubmitting}
              onChange={onNewPasswordChange}
            />
            <AuthFormField
              name="confirmNewPassword"
              label="Confirmar nova senha"
              leftIcon="password"
              type="password"
              placeholder="Confirme a nova senha"
              autoComplete="new-password"
              value={form.confirmNewPassword}
              error={fieldErrors.confirmNewPassword}
              disabled={isSubmitting}
              onChange={onConfirmNewPasswordChange}
            />
          </>
        ) : null}

        <ActionsStack>
          <AuthPrimaryButton loading={isSubmitting} type="submit">
            {submitLabel}
          </AuthPrimaryButton>

          {step === 'login-credentials' ? (
            <InlineActions>
              <AuthLinkButton
                onClick={switchToRecovery}
                disabled={isSubmitting}
              >
                Esqueci minha senha
              </AuthLinkButton>
            </InlineActions>
          ) : null}

          {canGoBack ? (
            <AuthLinkButton onClick={goBack} disabled={isSubmitting}>
              Voltar
            </AuthLinkButton>
          ) : null}

          {isRecoveryResultStep ? (
            <AuthLinkButton onClick={goToLogin} disabled={isSubmitting}>
              Ir para login
            </AuthLinkButton>
          ) : null}
        </ActionsStack>
      </form>

    </AuthCard>
  );
}
