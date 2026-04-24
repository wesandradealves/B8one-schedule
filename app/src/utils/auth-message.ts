const AUTH_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'Credenciais inválidas.',
  'Invalid or expired verification code': 'Código de verificação inválido ou expirado.',
  '2FA code sent to your e-mail.': 'Código 2FA enviado para seu e-mail.',
  'If the e-mail exists, a verification code was sent.':
    'Se o e-mail existir, um código de verificação foi enviado.',
  'Verification code validated successfully.':
    'Código de verificação validado com sucesso.',
  'Password updated successfully.': 'Senha atualizada com sucesso.',
};

export const normalizeAuthMessage = (
  message: string | null | undefined,
  fallback: string,
): string => {
  const normalizedMessage = message?.trim();

  if (!normalizedMessage) {
    return fallback;
  }

  return AUTH_MESSAGE_TRANSLATIONS[normalizedMessage] ?? normalizedMessage;
};

export const getAuthErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error) {
    return normalizeAuthMessage(error.message, fallback);
  }

  return fallback;
};
