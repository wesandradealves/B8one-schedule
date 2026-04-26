'use client';

import { useCallback, type FormEvent } from 'react';
import styled from 'styled-components';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';
import { ListActionButton } from '@/components/atoms/list-action-button';
import { ListFormSelect } from '@/components/atoms/list-form-controls';
import { AuthFormField } from '@/components/molecules/auth-form-field';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { useCreateUser } from '@/hooks/useCreateUser';

const FormCard = styled.section.attrs({
  className: 'mt-6 w-full max-w-2xl rounded-2xl border bg-white p-6',
})`
  border-color: var(--color-border);
`;

const FormLayout = styled.form.attrs({
  className: 'flex flex-col gap-4',
})``;

const SelectFieldRoot = styled.div.attrs({
  className: 'flex w-full flex-col gap-1.5',
})``;

const SelectLabel = styled.label.attrs({
  className: 'text-xs font-medium text-slate-700',
})``;

const FieldError = styled.span.attrs({
  className: 'text-xs text-red-600',
})``;

const FormActions = styled.div.attrs({
  className: 'mt-2 flex items-center justify-end gap-2',
})``;

const RestrictedCard = styled.section.attrs({
  className: 'mt-6 rounded-2xl border bg-white px-4 py-8 text-center text-sm',
})`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
`;

export function UserCreateForm() {
  const {
    form,
    fieldErrors,
    message,
    isSubmitting,
    canManageUsers,
    canSubmit,
    setField,
    submit,
    cancel,
  } = useCreateUser();

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submit();
    },
    [submit],
  );

  if (!canManageUsers) {
    return (
      <PageContainer>
        <PageTitle>Novo usuário</PageTitle>
        <PageDescription>Área restrita para administração de usuários.</PageDescription>
        <RestrictedCard>Acesso restrito ao perfil administrador.</RestrictedCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Novo usuário</PageTitle>
      <PageDescription>
        Preencha os dados para cadastrar um novo usuário. A conta será ativada
        após confirmação por e-mail.
      </PageDescription>

      <FormCard>
        <FormLayout onSubmit={onSubmit}>
          {message ? <AuthInlineMessage message={message} /> : null}

          <AuthFormField
            name="fullName"
            label="Nome completo"
            placeholder="Nome do usuário"
            autoComplete="name"
            value={form.fullName}
            error={fieldErrors.fullName}
            disabled={isSubmitting}
            onChange={(event) => setField('fullName', event.target.value)}
          />

          <AuthFormField
            name="email"
            label="E-mail"
            leftIcon="email"
            type="email"
            placeholder="usuario@empresa.com"
            autoComplete="email"
            value={form.email}
            error={fieldErrors.email}
            disabled={isSubmitting}
            onChange={(event) => setField('email', event.target.value)}
          />

          <AuthFormField
            name="password"
            label="Senha"
            leftIcon="password"
            type="password"
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            value={form.password}
            error={fieldErrors.password}
            disabled={isSubmitting}
            onChange={(event) => setField('password', event.target.value)}
          />

          <AuthFormField
            name="confirmPassword"
            label="Confirmar senha"
            leftIcon="password"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            value={form.confirmPassword}
            error={fieldErrors.confirmPassword}
            disabled={isSubmitting}
            onChange={(event) => setField('confirmPassword', event.target.value)}
          />

          <SelectFieldRoot>
            <SelectLabel htmlFor="new-user-profile">Perfil</SelectLabel>
            <ListFormSelect
              id="new-user-profile"
              aria-label="Perfil"
              value={form.profile}
              disabled={isSubmitting}
              onChange={(event) => setField('profile', event.target.value as 'ADMIN' | 'CLIENT')}
            >
              <option value="CLIENT">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </ListFormSelect>
            {fieldErrors.profile ? <FieldError>{fieldErrors.profile}</FieldError> : null}
          </SelectFieldRoot>

          <FormActions>
            <ListActionButton
              disabled={isSubmitting}
              type="button"
              variant="cancel"
              onClick={cancel}
            >
              Cancelar
            </ListActionButton>
            <AuthPrimaryButton
              type="submit"
              loading={isSubmitting}
              disabled={!canSubmit}
              fullWidth={false}
            >
              Criar usuário
            </AuthPrimaryButton>
          </FormActions>
        </FormLayout>
      </FormCard>
    </PageContainer>
  );
}
