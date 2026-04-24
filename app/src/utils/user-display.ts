import type { AuthUser } from '@/types/auth';

const DEFAULT_USER_LABEL = 'Minha conta';

const normalizeEmailLocalPart = (email: string): string => {
  return email.split('@')[0].trim();
};

const toWords = (value: string): string[] => {
  return value
    .replace(/[\W_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

const toTitleCaseWord = (word: string): string => {
  const firstChar = word.charAt(0).toUpperCase();
  const remainingChars = word.slice(1).toLowerCase();
  return `${firstChar}${remainingChars}`;
};

export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user?.email) {
    return DEFAULT_USER_LABEL;
  }

  const words = toWords(normalizeEmailLocalPart(user.email));
  if (words.length === 0) {
    return DEFAULT_USER_LABEL;
  }

  return words.map(toTitleCaseWord).join(' ');
};

export const getUserInitials = (user: AuthUser | null): string => {
  if (!user?.email) {
    return '';
  }

  const displayName = getUserDisplayName(user);
  if (displayName === DEFAULT_USER_LABEL) {
    return '';
  }

  const words = toWords(displayName);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words.join('').slice(0, 2).toUpperCase();
};
