'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedback } from '@/hooks/useFeedback';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { createUser } from '@/services/users.service';
import type { UserProfile } from '@/types/auth';
import type { AuthFlowMessage } from '@/types/auth';
import { getRequestErrorMessage } from '@/utils/request';
import { APP_ROUTES } from '@/utils/route';

type CreateUserField =
  | 'fullName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'profile';

interface CreateUserFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profile: UserProfile;
}

type CreateUserFieldErrors = Partial<Record<CreateUserField, string>>;

const createInitialFormState = (): CreateUserFormState => ({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profile: 'CLIENT',
});

export const useCreateUser = () => {
  const router = useRouter();
  const { canManageUsers } = useRolePermissions();
  const { publish } = useFeedback();

  const [form, setForm] = useState<CreateUserFormState>(() => createInitialFormState());
  const [fieldErrors, setFieldErrors] = useState<CreateUserFieldErrors>({});
  const [message, setMessage] = useState<AuthFlowMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    <TField extends CreateUserField>(field: TField, value: CreateUserFormState[TField]) => {
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

  const validate = useCallback((): CreateUserFieldErrors => {
    const errors: CreateUserFieldErrors = {};

    if (form.fullName.trim().length < 3) {
      errors.fullName = 'Informe o nome com ao menos 3 caracteres';
    }

    const normalizedEmail = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Informe um e-mail válido';
    }

    if (form.password.length < 6) {
      errors.password = 'A senha deve ter no mínimo 6 caracteres';
    }

    if (form.confirmPassword.length === 0) {
      errors.confirmPassword = 'Confirme a senha';
    }

    if (
      form.confirmPassword.length > 0 &&
      form.password.length > 0 &&
      form.password !== form.confirmPassword
    ) {
      errors.confirmPassword = 'As senhas não conferem';
    }

    return errors;
  }, [form.confirmPassword, form.email, form.fullName, form.password]);

  const canSubmit = useMemo(() => {
    if (!canManageUsers || isSubmitting) {
      return false;
    }

    return (
      form.fullName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.password.length > 0 &&
      form.confirmPassword.length > 0
    );
  }, [canManageUsers, form.confirmPassword.length, form.email, form.fullName, form.password.length, isSubmitting]);

  const submit = useCallback(async () => {
    if (!canManageUsers) {
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
      await createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        profile: form.profile,
      });

      const successMessage =
        'Usuário criado. Um link de confirmação foi enviado para ativação da conta.';
      publish('success', successMessage);
      setMessage({ level: 'success', text: successMessage });
      router.push(APP_ROUTES.users);
    } catch (error) {
      const errorMessage = getRequestErrorMessage(error);
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [canManageUsers, form.email, form.fullName, form.password, form.profile, publish, router, validate]);

  const cancel = useCallback(() => {
    router.push(APP_ROUTES.users);
  }, [router]);

  return {
    form,
    fieldErrors,
    message,
    isSubmitting,
    canManageUsers,
    canSubmit,
    setField,
    submit,
    cancel,
  };
};
