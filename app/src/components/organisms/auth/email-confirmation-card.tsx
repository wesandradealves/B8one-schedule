'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { AuthBrandLogo } from '@/components/atoms/auth-brand-logo';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';
import { AuthStepHeader } from '@/components/molecules/auth-step-header';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { APP_ROUTES } from '@/utils/route';

const AuthCard = styled.section.attrs({
  className: 'mx-auto flex w-full max-w-sm flex-col gap-6 py-10',
})``;

const ActionsStack = styled.div.attrs({
  className: 'flex flex-col gap-3',
})``;

export function EmailConfirmationCard() {
  const { status, message, actionLabel, goToLogin } = useEmailConfirmation();

  const description = useMemo(() => {
    if (status === 'loading') {
      return 'Estamos validando o link enviado para seu e-mail.';
    }

    if (status === 'success') {
      return 'Conta ativada com sucesso. Você já pode entrar no sistema.';
    }

    return 'Não foi possível concluir a confirmação. Solicite um novo link com o administrador.';
  }, [status]);

  useSeoMetadata({
    title: 'Confirmar e-mail',
    description,
    path: APP_ROUTES.confirmEmail,
    indexable: false,
  });

  return (
    <AuthCard>
      <div className="flex justify-center">
        <AuthBrandLogo tone="primary" size="lg" />
      </div>

      <AuthStepHeader title="Confirmação de e-mail" description={description} />

      <AuthInlineMessage message={message} />

      <ActionsStack>
        <AuthPrimaryButton
          type="button"
          disabled={status === 'loading'}
          onClick={goToLogin}
        >
          {actionLabel}
        </AuthPrimaryButton>
      </ActionsStack>
    </AuthCard>
  );
}
