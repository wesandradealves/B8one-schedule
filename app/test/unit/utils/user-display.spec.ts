import { getUserDisplayName, getUserInitials } from '@/utils/user-display';

describe('user-display utils', () => {
  it('should fallback to default labels when user is missing', () => {
    expect(getUserDisplayName(null)).toBe('Minha conta');
    expect(getUserInitials(null)).toBe('');
  });

  it('should derive display name and initials from email', () => {
    expect(
      getUserDisplayName({
        id: 'user-1',
        email: 'cortney.reichel43@ethereal.email',
        profile: 'CLIENT',
      }),
    ).toBe('Cortney Reichel43');

    expect(
      getUserInitials({
        id: 'user-1',
        email: 'cortney.reichel43@ethereal.email',
        profile: 'CLIENT',
      }),
    ).toBe('CR');
  });

  it('should fallback to defaults when email local part is empty after normalization', () => {
    expect(
      getUserDisplayName({
        id: 'user-1',
        email: '@ethereal.email',
        profile: 'CLIENT',
      }),
    ).toBe('Minha conta');

    expect(
      getUserInitials({
        id: 'user-1',
        email: '@ethereal.email',
        profile: 'CLIENT',
      }),
    ).toBe('');
  });

  it('should build initials from single-word display names', () => {
    expect(
      getUserInitials({
        id: 'user-1',
        email: 'ana@ethereal.email',
        profile: 'CLIENT',
      }),
    ).toBe('AN');
  });
});
