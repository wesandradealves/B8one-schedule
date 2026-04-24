'use client';

import { useCallback, type FormEvent } from 'react';
import styled from 'styled-components';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';
import { AuthFormField } from '@/components/molecules/auth-form-field';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';
import { useMyAccount } from '@/hooks/useMyAccount';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';

const FormCard = styled.section.attrs({
  className: 'mt-6 w-full max-w-2xl rounded-2xl border bg-white p-6',
})`
  border-color: var(--color-border);
`;

const FormLayout = styled.form.attrs({
  className: 'flex flex-col gap-4',
})``;

const SkeletonBlock = styled.div.attrs<{ $widthClass: string }>(({ $widthClass }) => ({
  className: `h-4 animate-pulse rounded bg-slate-200 ${$widthClass}`,
}))``;

const LoadingState = styled.div.attrs({
  className: 'mt-6 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border bg-white p-6',
})`
  border-color: var(--color-border);
`;

export function MyAccountForm() {
  const {
    form,
    fieldErrors,
    message,
    isLoading,
    isSubmitting,
    canSubmit,
    setField,
    submit,
  } = useMyAccount();

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submit();
    },
    [submit],
  );

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle>Minha conta</PageTitle>
        <PageDescription>Atualize seus dados pessoais.</PageDescription>

        <LoadingState aria-busy>
          <SkeletonBlock $widthClass="w-32" />
          <SkeletonBlock $widthClass="w-full" />
          <SkeletonBlock $widthClass="w-full" />
          <SkeletonBlock $widthClass="w-full" />
          <SkeletonBlock $widthClass="w-40" />
        </LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Minha conta</PageTitle>
      <PageDescription>Atualize sua senha.</PageDescription>

      <FormCard>
        <FormLayout onSubmit={onSubmit}>
          {message ? <AuthInlineMessage message={message} /> : null}

          <AuthFormField
            name="fullName"
            label="Nome completo"
            placeholder="Nome do usuário"
            autoComplete="name"
            value={form.fullName}
            readOnly
            disabled
          />

          <AuthFormField
            name="email"
            label="E-mail"
            leftIcon="email"
            type="email"
            value={form.email}
            readOnly
            disabled
          />

          <AuthFormField
            name="password"
            label="Nova senha"
            leftIcon="password"
            type="password"
            placeholder="Deixe em branco para manter a senha atual"
            autoComplete="new-password"
            value={form.password}
            error={fieldErrors.password}
            disabled={isSubmitting}
            onChange={(event) => setField('password', event.target.value)}
          />

          <AuthFormField
            name="confirmPassword"
            label="Confirmar nova senha"
            leftIcon="password"
            type="password"
            placeholder="Confirme a nova senha"
            autoComplete="new-password"
            value={form.confirmPassword}
            error={fieldErrors.confirmPassword}
            disabled={isSubmitting}
            onChange={(event) => setField('confirmPassword', event.target.value)}
          />

          <AuthPrimaryButton type="submit" loading={isSubmitting} disabled={!canSubmit}>
            Salvar alterações
          </AuthPrimaryButton>
        </FormLayout>
      </FormCard>
    </PageContainer>
  );
}
