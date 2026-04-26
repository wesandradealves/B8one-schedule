'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedback } from '@/hooks/useFeedback';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { createExam } from '@/services/exams.service';
import type { AuthFlowMessage } from '@/types/auth';
import {
  DEFAULT_EXAM_AVAILABLE_END_TIME,
  DEFAULT_EXAM_AVAILABLE_START_TIME,
  DEFAULT_EXAM_AVAILABLE_WEEKDAYS,
  normalizeAvailableWeekdays,
  normalizeExamAvailability,
  validateExamAvailability,
} from '@/utils/exam-availability';
import { getRequestErrorMessage } from '@/utils/request';
import { APP_ROUTES } from '@/utils/route';

type CreateExamField =
  | 'name'
  | 'description'
  | 'durationMinutes'
  | 'priceCents'
  | 'availableStartTime'
  | 'availableEndTime'
  | 'availableFromDate'
  | 'availableToDate';

interface CreateExamFormState {
  name: string;
  description: string;
  durationMinutes: string;
  priceCents: string;
  availableWeekdays: number[];
  availableStartTime: string;
  availableEndTime: string;
  availableFromDate: string;
  availableToDate: string;
}

type CreateExamFieldErrors = Partial<
  Record<CreateExamField | 'availableWeekdays', string>
>;

const createInitialFormState = (): CreateExamFormState => ({
  name: '',
  description: '',
  durationMinutes: '20',
  priceCents: '',
  availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
  availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
  availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
  availableFromDate: '',
  availableToDate: '',
});

export const useCreateExam = () => {
  const router = useRouter();
  const { canManageExams } = useRolePermissions();
  const { publish } = useFeedback();

  const [form, setForm] = useState<CreateExamFormState>(() => createInitialFormState());
  const [fieldErrors, setFieldErrors] = useState<CreateExamFieldErrors>({});
  const [message, setMessage] = useState<AuthFlowMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    (field: CreateExamField, value: string) => {
      setForm((currentState) => ({
        ...currentState,
        [field]: value,
      }));
      setFieldErrors((currentState) => ({
        ...currentState,
        [field]: undefined,
      }));
      setMessage(null);
    },
    [],
  );

  const toggleWeekday = useCallback((weekday: number, checked: boolean) => {
    setForm((currentState) => {
      const current = new Set(currentState.availableWeekdays);

      if (checked) {
        current.add(weekday);
      } else {
        current.delete(weekday);
      }

      return {
        ...currentState,
        availableWeekdays: normalizeAvailableWeekdays([...current]),
      };
    });
    setFieldErrors((currentState) => ({
      ...currentState,
      availableWeekdays: undefined,
    }));
    setMessage(null);
  }, []);

  const validate = useCallback((): CreateExamFieldErrors => {
    const errors: CreateExamFieldErrors = {};
    const durationMinutes = Number(form.durationMinutes);
    const priceCents = Number(form.priceCents);

    if (form.name.trim().length < 2) {
      errors.name = 'Informe o nome do exame com ao menos 2 caracteres';
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      errors.durationMinutes = 'Informe uma duração válida em minutos';
    }

    if (!Number.isInteger(priceCents) || priceCents < 0) {
      errors.priceCents = 'Informe um valor em centavos igual ou maior que zero';
    }

    const availabilityErrors = validateExamAvailability(
      normalizeExamAvailability({
        availableWeekdays: form.availableWeekdays,
        availableStartTime: form.availableStartTime,
        availableEndTime: form.availableEndTime,
        availableFromDate: form.availableFromDate.trim() || null,
        availableToDate: form.availableToDate.trim() || null,
      }),
    );

    if (availabilityErrors.availableWeekdays) {
      errors.availableWeekdays = availabilityErrors.availableWeekdays;
    }
    if (availabilityErrors.availableStartTime) {
      errors.availableStartTime = availabilityErrors.availableStartTime;
    }
    if (availabilityErrors.availableEndTime) {
      errors.availableEndTime = availabilityErrors.availableEndTime;
    }
    if (availabilityErrors.availableFromDate) {
      errors.availableFromDate = availabilityErrors.availableFromDate;
    }
    if (availabilityErrors.availableToDate) {
      errors.availableToDate = availabilityErrors.availableToDate;
    }

    return errors;
  }, [
    form.availableEndTime,
    form.availableFromDate,
    form.availableStartTime,
    form.availableToDate,
    form.availableWeekdays,
    form.durationMinutes,
    form.name,
    form.priceCents,
  ]);

  const canSubmit = useMemo(() => {
    if (!canManageExams || isSubmitting) {
      return false;
    }

    return (
      form.name.trim().length > 0 &&
      form.durationMinutes.length > 0 &&
      form.priceCents.length > 0 &&
      form.availableWeekdays.length > 0 &&
      form.availableStartTime.length > 0 &&
      form.availableEndTime.length > 0
    );
  }, [
    canManageExams,
    form.availableEndTime.length,
    form.availableStartTime.length,
    form.availableWeekdays.length,
    form.durationMinutes.length,
    form.name,
    form.priceCents.length,
    isSubmitting,
  ]);

  const submit = useCallback(async () => {
    if (!canManageExams) {
      const errorMessage = 'Acesso restrito ao perfil administrador.';
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
      return;
    }

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const availability = normalizeExamAvailability({
        availableWeekdays: form.availableWeekdays,
        availableStartTime: form.availableStartTime,
        availableEndTime: form.availableEndTime,
        availableFromDate: form.availableFromDate.trim() || null,
        availableToDate: form.availableToDate.trim() || null,
      });

      await createExam({
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        durationMinutes: Number(form.durationMinutes),
        priceCents: Number(form.priceCents),
        availableWeekdays: availability.availableWeekdays,
        availableStartTime: availability.availableStartTime,
        availableEndTime: availability.availableEndTime,
        availableFromDate: availability.availableFromDate,
        availableToDate: availability.availableToDate,
      });

      const successMessage = 'Exame criado com sucesso.';
      publish('success', successMessage);
      setMessage({ level: 'success', text: successMessage });
      router.push(APP_ROUTES.exams);
    } catch (error) {
      const errorMessage = getRequestErrorMessage(error);
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canManageExams,
    form.availableEndTime,
    form.availableFromDate,
    form.availableStartTime,
    form.availableToDate,
    form.availableWeekdays,
    form.description,
    form.durationMinutes,
    form.name,
    form.priceCents,
    publish,
    router,
    validate,
  ]);

  const cancel = useCallback(() => {
    router.push(APP_ROUTES.exams);
  }, [router]);

  return {
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
  };
};
