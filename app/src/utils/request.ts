import axios, { type AxiosResponse } from 'axios';

const REQUEST_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'Credenciais inválidas.',
  'Invalid or expired verification code': 'Código de verificação inválido ou expirado.',
  '2FA code sent to your e-mail.': 'Código 2FA enviado para seu e-mail.',
  'If the e-mail exists, a verification code was sent.':
    'Se o e-mail existir, um código de verificação foi enviado.',
  'Verification code validated successfully.':
    'Código de verificação validado com sucesso.',
  'Password updated successfully.': 'Senha atualizada com sucesso.',
  'Invalid or expired e-mail confirmation link':
    'Link de confirmação inválido ou expirado.',
  'E-mail already in use': 'E-mail já está em uso.',
  'User not found': 'Usuário não encontrado.',
  'Exam not found': 'Exame não encontrado.',
  'Appointment not found': 'Agendamento não encontrado.',
  'Scheduled date must be in the future': 'A data do agendamento deve ser futura.',
  'Scheduled date is outside exam availability':
    'Data/hora fora da disponibilidade do exame.',
  'There is already an appointment for this exam/time slot':
    'Já existe um agendamento para este exame no horário informado.',
  '"startsAt" must be before "endsAt"':
    '"startsAt" deve ser anterior a "endsAt".',
  'At least one field must be provided':
    'Informe ao menos um campo para atualização.',
  'Invalid date format': 'Formato de data inválido.',
};

const normalizeRequestMessage = (
  message: string | null | undefined,
  fallback: string,
): string => {
  const normalizedMessage = message?.trim();
  if (!normalizedMessage) {
    return fallback;
  }

  return REQUEST_MESSAGE_TRANSLATIONS[normalizedMessage] ?? normalizedMessage;
};

export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString.length > 0 ? `?${queryString}` : '';
};

export const getRequestErrorMessage = (error: unknown): string => {
  const fallback = 'Erro inesperado na requisição.';

  if (axios.isAxiosError(error)) {
    return normalizeRequestMessage(error.response?.data?.message, error.message || fallback);
  }

  if (error instanceof Error) {
    return normalizeRequestMessage(error.message, fallback);
  }

  return fallback;
};

export const executeRequest = async <T>(
  request: () => Promise<AxiosResponse<T>>,
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getRequestErrorMessage(error));
  }
};
