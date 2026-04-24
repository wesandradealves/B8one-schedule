'use client';

import { create } from 'zustand';
import type {
  AuthFlowField,
  AuthFlowMessage,
  AuthFlowMode,
  AuthFlowStep,
} from '@/types/auth';

export interface AuthFlowFormData {
  email: string;
  password: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type AuthFlowFieldErrors = Partial<Record<AuthFlowField, string>>;

interface AuthFlowStoreState {
  mode: AuthFlowMode;
  step: AuthFlowStep;
  form: AuthFlowFormData;
  twoFactorExpiresInSeconds: number;
  fieldErrors: AuthFlowFieldErrors;
  message: AuthFlowMessage | null;
  isSubmitting: boolean;
  setMode: (mode: AuthFlowMode) => void;
  setStep: (step: AuthFlowStep) => void;
  setField: (field: AuthFlowField, value: string) => void;
  setForm: (form: Partial<AuthFlowFormData>) => void;
  setTwoFactorExpiresInSeconds: (seconds: number) => void;
  setFieldErrors: (errors: AuthFlowFieldErrors) => void;
  clearFieldErrors: () => void;
  setMessage: (message: AuthFlowMessage | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetState: () => void;
}

const initialFormData: AuthFlowFormData = {
  email: '',
  password: '',
  code: '',
  newPassword: '',
  confirmNewPassword: '',
};

const DEFAULT_TWO_FACTOR_EXPIRATION_SECONDS = 600;

const initialState = {
  mode: 'login' as AuthFlowMode,
  step: 'login-credentials' as AuthFlowStep,
  form: initialFormData,
  twoFactorExpiresInSeconds: DEFAULT_TWO_FACTOR_EXPIRATION_SECONDS,
  fieldErrors: {},
  message: null,
  isSubmitting: false,
};

const cloneInitialFormData = (): AuthFlowFormData => ({ ...initialFormData });

export const useAuthFlowStore = create<AuthFlowStoreState>((set) => ({
  ...initialState,
  form: cloneInitialFormData(),
  setMode: (mode) => set(() => ({ mode })),
  setStep: (step) => set(() => ({ step })),
  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
      fieldErrors: {
        ...state.fieldErrors,
        [field]: undefined,
      },
    })),
  setForm: (form) =>
    set((state) => ({
      form: {
        ...state.form,
        ...form,
      },
    })),
  setTwoFactorExpiresInSeconds: (seconds) =>
    set(() => ({
      twoFactorExpiresInSeconds: seconds,
    })),
  setFieldErrors: (errors) => set(() => ({ fieldErrors: errors })),
  clearFieldErrors: () => set(() => ({ fieldErrors: {} })),
  setMessage: (message) => set(() => ({ message })),
  setSubmitting: (isSubmitting) => set(() => ({ isSubmitting })),
  resetState: () =>
    set(() => ({
      ...initialState,
      form: cloneInitialFormData(),
    })),
}));
