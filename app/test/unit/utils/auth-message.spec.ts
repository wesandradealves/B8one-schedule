import { getAuthErrorMessage, normalizeAuthMessage } from '@/utils/auth-message';

describe('auth-message utils', () => {
  it('should translate known backend auth messages to portuguese', () => {
    expect(
      normalizeAuthMessage('Invalid credentials', 'Falha na autenticação'),
    ).toBe('Credenciais inválidas.');

    expect(
      normalizeAuthMessage(
        'Invalid or expired verification code',
        'Falha ao validar código',
      ),
    ).toBe('Código de verificação inválido ou expirado.');
  });

  it('should keep unknown messages unchanged', () => {
    expect(normalizeAuthMessage('Erro de negócio customizado', 'fallback')).toBe(
      'Erro de negócio customizado',
    );
  });

  it('should return fallback when message is empty', () => {
    expect(normalizeAuthMessage('', 'fallback')).toBe('fallback');
    expect(normalizeAuthMessage('   ', 'fallback')).toBe('fallback');
    expect(normalizeAuthMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('should extract translated message from Error instances', () => {
    expect(
      getAuthErrorMessage(new Error('Invalid credentials'), 'fallback'),
    ).toBe('Credenciais inválidas.');
  });

  it('should fallback for unknown error values', () => {
    expect(getAuthErrorMessage('unknown', 'fallback')).toBe('fallback');
  });
});
