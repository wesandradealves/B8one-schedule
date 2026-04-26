'use client';

import { useCallback, type FormEvent } from 'react';
import styled from 'styled-components';
import { AuthCheckbox } from '@/components/atoms/auth-checkbox';
import { AuthPrimaryButton } from '@/components/atoms/auth-primary-button';
import { ListActionButton } from '@/components/atoms/list-action-button';
import { AuthFormField } from '@/components/molecules/auth-form-field';
import { AuthInlineMessage } from '@/components/molecules/auth-inline-message';
import { PageContainer, PageDescription, PageTitle } from '@/components/shared/page-container';
import { useCreateExam } from '@/hooks/useCreateExam';
import { EXAM_WEEKDAY_OPTIONS } from '@/utils/exam-availability';

const FormCard = styled.section.attrs({
  className: 'mt-6 w-full max-w-2xl rounded-2xl border bg-white p-6',
})`
  border-color: var(--color-border);
`;

const FormLayout = styled.form.attrs({
  className: 'flex flex-col gap-4',
  noValidate: true,
})``;

const FormActions = styled.div.attrs({
  className: 'mt-2 flex items-center justify-end gap-2',
})``;

const AvailabilitySection = styled.div.attrs({
  className: 'rounded-xl border border-slate-200 p-4',
})``;

const AvailabilityTitle = styled.p.attrs({
  className: 'text-sm font-semibold text-slate-800',
})``;

const AvailabilityDescription = styled.p.attrs({
  className: 'mt-1 text-xs text-slate-500',
})``;

const WeekdayGrid = styled.div.attrs({
  className: 'mt-3 flex flex-wrap gap-3',
})``;

const FieldError = styled.span.attrs({
  className: 'mt-2 block text-xs text-red-600',
})``;

const RestrictedCard = styled.section.attrs({
  className: 'mt-6 rounded-2xl border bg-white px-4 py-8 text-center text-sm',
})`
  border-color: var(--color-border);
  color: var(--color-text-secondary);
`;

export function ExamCreateForm() {
  const {
    form,
    fieldErrors,
    message,
    isSubmitting,
    canManageExams,
    canSubmit,
    setField,
    toggleWeekday,
    submit,
    cancel,
  } = useCreateExam();

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submit();
    },
    [submit],
  );

  if (!canManageExams) {
    return (
      <PageContainer>
        <PageTitle>Novo exame</PageTitle>
        <PageDescription>Área restrita para administração de exames.</PageDescription>
        <RestrictedCard>Acesso restrito ao perfil administrador.</RestrictedCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Novo exame</PageTitle>
      <PageDescription>
        Preencha os dados para cadastrar um novo exame. As datas disponíveis são definidas pela
        agenda de agendamentos no calendário.
      </PageDescription>

      <FormCard>
        <FormLayout onSubmit={onSubmit}>
          {message ? <AuthInlineMessage message={message} /> : null}

          <AuthFormField
            name="name"
            label="Nome do exame"
            placeholder="Ex.: Hemograma Completo"
            value={form.name}
            error={fieldErrors.name}
            disabled={isSubmitting}
            onChange={(event) => setField('name', event.target.value)}
          />

          <AuthFormField
            name="description"
            label="Descrição"
            placeholder="Descrição opcional"
            value={form.description}
            error={fieldErrors.description}
            disabled={isSubmitting}
            onChange={(event) => setField('description', event.target.value)}
          />

          <AuthFormField
            name="durationMinutes"
            label="Duração (minutos)"
            min={1}
            step={1}
            type="number"
            value={form.durationMinutes}
            error={fieldErrors.durationMinutes}
            disabled={isSubmitting}
            onChange={(event) => setField('durationMinutes', event.target.value)}
          />

          <AuthFormField
            name="priceCents"
            label="Valor (centavos)"
            placeholder="Ex.: 4500 (R$ 45,00)"
            min={0}
            step={1}
            type="number"
            value={form.priceCents}
            error={fieldErrors.priceCents}
            disabled={isSubmitting}
            onChange={(event) => setField('priceCents', event.target.value)}
          />

          <AvailabilitySection>
            <AvailabilityTitle>Disponibilidade do exame</AvailabilityTitle>
            <AvailabilityDescription>
              Defina os dias e horário para permitir agendamentos no calendário.
            </AvailabilityDescription>

            <WeekdayGrid>
              {EXAM_WEEKDAY_OPTIONS.map((option) => (
                <AuthCheckbox
                  key={option.value}
                  checked={form.availableWeekdays.includes(option.value)}
                  disabled={isSubmitting}
                  label={option.label}
                  onChange={(event) => toggleWeekday(option.value, event.target.checked)}
                />
              ))}
            </WeekdayGrid>
            {fieldErrors.availableWeekdays ? (
              <FieldError>{fieldErrors.availableWeekdays}</FieldError>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <AuthFormField
                name="availableStartTime"
                label="Horário inicial"
                type="time"
                value={form.availableStartTime}
                error={fieldErrors.availableStartTime}
                disabled={isSubmitting}
                onChange={(event) => setField('availableStartTime', event.target.value)}
              />

              <AuthFormField
                name="availableEndTime"
                label="Horário final"
                type="time"
                value={form.availableEndTime}
                error={fieldErrors.availableEndTime}
                disabled={isSubmitting}
                onChange={(event) => setField('availableEndTime', event.target.value)}
              />
            </div>

            <div className="mt-1 grid gap-4 sm:grid-cols-2">
              <AuthFormField
                name="availableFromDate"
                label="Disponível a partir de"
                type="date"
                value={form.availableFromDate}
                error={fieldErrors.availableFromDate}
                disabled={isSubmitting}
                onChange={(event) => setField('availableFromDate', event.target.value)}
              />

              <AuthFormField
                name="availableToDate"
                label="Disponível até"
                type="date"
                value={form.availableToDate}
                error={fieldErrors.availableToDate}
                disabled={isSubmitting}
                onChange={(event) => setField('availableToDate', event.target.value)}
              />
            </div>
          </AvailabilitySection>

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
              Criar exame
            </AuthPrimaryButton>
          </FormActions>
        </FormLayout>
      </FormCard>
    </PageContainer>
  );
}
