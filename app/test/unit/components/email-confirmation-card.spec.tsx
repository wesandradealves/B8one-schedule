import { fireEvent, render, screen } from '@testing-library/react';
import { EmailConfirmationCard } from '@/components/organisms/auth/email-confirmation-card';

const useEmailConfirmationMock = jest.fn();
const useSeoMetadataMock = jest.fn();

jest.mock('@/hooks/useEmailConfirmation', () => ({
  useEmailConfirmation: () => useEmailConfirmationMock(),
}));

jest.mock('@/hooks/useSeoMetadata', () => ({
  useSeoMetadata: (...args: unknown[]) => useSeoMetadataMock(...args),
}));

describe('EmailConfirmationCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state and disables action button', () => {
    useEmailConfirmationMock.mockReturnValue({
      status: 'loading',
      message: {
        level: 'info',
        text: 'Validando link de confirmação...',
      },
      actionLabel: 'Voltar ao login',
      goToLogin: jest.fn(),
    });

    render(<EmailConfirmationCard />);

    expect(screen.getByText('Confirmação de e-mail')).toBeInTheDocument();
    expect(
      screen.getByText('Estamos validando o link enviado para seu e-mail.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar ao login' })).toBeDisabled();
  });

  it('renders success state and triggers login navigation action', () => {
    const goToLogin = jest.fn();
    useEmailConfirmationMock.mockReturnValue({
      status: 'success',
      message: {
        level: 'success',
        text: 'E-mail confirmado com sucesso. Conta ativada.',
      },
      actionLabel: 'Ir para login',
      goToLogin,
    });

    render(<EmailConfirmationCard />);

    expect(
      screen.getByText('Conta ativada com sucesso. Você já pode entrar no sistema.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir para login' }));
    expect(goToLogin).toHaveBeenCalledTimes(1);
  });
});
