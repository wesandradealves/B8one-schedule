import {
  EXAM_VALIDATION_MESSAGES,
  USER_VALIDATION_MESSAGES,
  getExamDurationValidationError,
  getExamNameValidationError,
  getExamPriceValidationError,
  getUserEmailValidationError,
  getUserFullNameValidationError,
  isValidEmail,
  normalizeEmail,
} from '@/utils/form-validation';

describe('form-validation utils', () => {
  it('should normalize e-mail by trimming and lowering case', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
  });

  it('should validate e-mail format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user')).toBe(false);
  });

  it('should validate user full name length', () => {
    expect(getUserFullNameValidationError('ab')).toBe(
      USER_VALIDATION_MESSAGES.fullNameMin,
    );
    expect(getUserFullNameValidationError('Wesley Andrade')).toBeNull();
  });

  it('should validate user e-mail', () => {
    expect(getUserEmailValidationError('invalid')).toBe(
      USER_VALIDATION_MESSAGES.invalidEmail,
    );
    expect(getUserEmailValidationError('user@example.com')).toBeNull();
  });

  it('should validate exam name', () => {
    expect(getExamNameValidationError('a')).toBe(EXAM_VALIDATION_MESSAGES.nameMin);
    expect(getExamNameValidationError('Creatinina')).toBeNull();
  });

  it('should validate exam duration', () => {
    expect(getExamDurationValidationError(0)).toBe(
      EXAM_VALIDATION_MESSAGES.durationInvalid,
    );
    expect(getExamDurationValidationError(20)).toBeNull();
  });

  it('should validate exam price', () => {
    expect(getExamPriceValidationError(-1)).toBe(
      EXAM_VALIDATION_MESSAGES.priceInvalid,
    );
    expect(getExamPriceValidationError(4500)).toBeNull();
  });
});
