import { createHash, randomBytes } from 'crypto';

const EMAIL_CONFIRMATION_TOKEN_BYTES = 32;

export const generateEmailConfirmationToken = (): string => {
  return randomBytes(EMAIL_CONFIRMATION_TOKEN_BYTES).toString('hex');
};

export const hashEmailConfirmationToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

