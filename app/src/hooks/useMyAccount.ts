'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { useLogout } from '@/hooks/useLogout';
import { getUserById, updateUserById } from '@/services/users.service';
import type { AuthFlowMessage } from '@/types/auth';
import type { UpdateUserPayload } from '@/types/user';
import { getRequestErrorMessage } from '@/utils/request';

type MyAccountField = 'password' | 'confirmPassword';

interface MyAccountFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type MyAccountFieldErrors = Partial<Record<MyAccountField, string>>;

const createInitialFormState = (): MyAccountFormState => ({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

export const useMyAccount = () => {
  const { user } = useAuth();
  const { publish } = useFeedback();
  const logout = useLogout();

  const [form, setForm] = useState<MyAccountFormState>(() => createInitialFormState());
  const [fieldErrors, setFieldErrors] = useState<MyAccountFieldErrors>({});
  const [message, setMessage] = useState<AuthFlowMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      if (!user?.id) {
        setForm((currentState) => ({
          ...currentState,
          email: user?.email ?? '',
        }));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const currentUser = await getUserById(user.id);
        if (cancelled) {
          return;
        }

        setForm({
          fullName: currentUser.fullName,
          email: currentUser.email,
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const errorMessage = getRequestErrorMessage(error);
        setMessage({ level: 'error', text: errorMessage });
        publish('error', errorMessage);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [publish, user?.email, user?.id]);

  const setField = useCallback(
    (field: MyAccountField, value: string) => {
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

  const hasPasswordChange = useMemo(() => form.password.trim().length > 0, [form.password]);
  const hasChanges = useMemo(() => hasPasswordChange, [hasPasswordChange]);

  const validate = useCallback((): MyAccountFieldErrors => {
    const errors: MyAccountFieldErrors = {};

    if (hasPasswordChange && form.password.length < 6) {
      errors.password = 'A senha deve ter no minimo 6 caracteres';
    }

    if (!hasPasswordChange && form.confirmPassword.length > 0) {
      errors.confirmPassword = 'Informe uma nova senha antes de confirmar';
    }

    if (hasPasswordChange && form.confirmPassword.length === 0) {
      errors.confirmPassword = 'Confirme a nova senha';
    }

    if (
      hasPasswordChange &&
      form.confirmPassword.length > 0 &&
      form.confirmPassword !== form.password
    ) {
      errors.confirmPassword = 'As senhas nao conferem';
    }

    return errors;
  }, [form.confirmPassword, form.password, hasPasswordChange]);

  const canSubmit = useMemo(() => {
    if (isLoading || isSubmitting || !user?.id || !hasChanges) {
      return false;
    }

    return true;
  }, [hasChanges, isLoading, isSubmitting, user?.id]);

  const submit = useCallback(async () => {
    if (!user?.id) {
      const errorMessage = 'Sessão inválida. Faça login novamente.';
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
      return;
    }

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!hasChanges) {
      setMessage({
        level: 'info',
        text: 'Nenhuma alteração para salvar.',
      });
      return;
    }

    const payload: UpdateUserPayload = {
      password: form.password,
    };

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateUserById(user.id, payload);
      const successMessage = 'Senha atualizada com sucesso. Faça login novamente.';
      publish('success', successMessage);
      logout();
    } catch (error) {
      const errorMessage = getRequestErrorMessage(error);
      setMessage({ level: 'error', text: errorMessage });
      publish('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    form.password,
    hasChanges,
    logout,
    publish,
    user?.id,
    validate,
  ]);

  return {
    form,
    fieldErrors,
    message,
    isLoading,
    isSubmitting,
    canSubmit,
    setField,
    submit,
  };
};
