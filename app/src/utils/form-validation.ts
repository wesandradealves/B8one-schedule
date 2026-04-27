const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USER_VALIDATION_MESSAGES = {
  fullNameMin: 'Informe o nome com ao menos 3 caracteres',
  invalidEmail: 'Informe um e-mail válido',
} as const;

export const EXAM_VALIDATION_MESSAGES = {
  nameMin: 'Informe o nome do exame com ao menos 2 caracteres',
  durationInvalid: 'Informe uma duração válida em minutos',
  priceInvalid: 'Informe um valor em centavos igual ou maior que zero',
} as const;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isValidEmail = (email: string): boolean => {
  return EMAIL_PATTERN.test(normalizeEmail(email));
};

export const getUserFullNameValidationError = (fullName: string): string | null => {
  if (fullName.trim().length < 3) {
    return USER_VALIDATION_MESSAGES.fullNameMin;
  }

  return null;
};

export const getUserEmailValidationError = (email: string): string | null => {
  if (!isValidEmail(email)) {
    return USER_VALIDATION_MESSAGES.invalidEmail;
  }

  return null;
};

export const getExamNameValidationError = (name: string): string | null => {
  if (name.trim().length < 2) {
    return EXAM_VALIDATION_MESSAGES.nameMin;
  }

  return null;
};

export const getExamDurationValidationError = (
  durationMinutes: number,
): string | null => {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return EXAM_VALIDATION_MESSAGES.durationInvalid;
  }

  return null;
};

export const getExamPriceValidationError = (priceCents: number): string | null => {
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    return EXAM_VALIDATION_MESSAGES.priceInvalid;
  }

  return null;
};
