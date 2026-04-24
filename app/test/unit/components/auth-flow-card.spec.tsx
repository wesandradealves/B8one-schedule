import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthFlowCard } from '@/components/organisms/auth/auth-flow-card';
import { useAuthFlowStore } from '@/hooks/useAuthFlow.store';
import {
  login,
  verifyTwoFactor,
} from '@/services/auth.service';

const replaceMock = jest.fn();
const searchParamGetMock = jest.fn();
const setSessionMock = jest.fn();
const publishMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: searchParamGetMock,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    setSession: setSessionMock,
  }),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
  verifyTwoFactor: jest.fn(),
  requestPasswordRecovery: jest.fn(),
  verifyPasswordRecoveryCode: jest.fn(),
  resetPassword: jest.fn(),
}));

describe('AuthFlowCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParamGetMock.mockReturnValue(null);
    useAuthFlowStore.getState().resetState();
  });

  it('should render login step and switch to recovery in-place', () => {
    render(<AuthFlowCard />);

    expect(screen.getByText('Entrar na conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));

    expect(screen.getByText('Recuperar senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should show validation message when credentials are invalid', async () => {
    render(<AuthFlowCard />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Informe um e-mail valido')).toBeInTheDocument();
      expect(
        screen.getByText('A senha deve ter entre 6 e 128 caracteres'),
      ).toBeInTheDocument();
    });
  });

  it('should execute login + 2fa and redirect to protected area', async () => {
    (login as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: '2FA sent',
      twoFactorExpiresInSeconds: 600,
    });
    (verifyTwoFactor as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      profile: 'ADMIN',
    });

    render(<AuthFlowCard />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@b8one.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Admin@123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Confirme o 2FA')).toBeInTheDocument();
    });

    expect(screen.getByText('Codigo expira em: 10:00')).toBeInTheDocument();

    const otpInputs = screen.getAllByLabelText(/Digito \d do codigo 2FA/i);
    fireEvent.paste(otpInputs[0], {
      clipboardData: {
        getData: () => '123456',
      },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Validar codigo' }).closest('form')!,
    );

    await waitFor(() => {
      expect(setSessionMock).toHaveBeenCalledWith('jwt-token');
      expect(replaceMock).toHaveBeenCalledWith('/app');
    });
  });

  it('should translate backend auth error and render centered inline message', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<AuthFlowCard />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@b8one.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Admin@123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument();
    });

    expect(screen.getByText('Credenciais inválidas.')).toHaveClass('text-center');
    expect(publishMock).toHaveBeenCalledWith('error', 'Credenciais inválidas.');
  });
});
