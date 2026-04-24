import { fireEvent, render, screen } from '@testing-library/react';
import { MyAccountForm } from '@/components/organisms/protected/my-account-form';

const useMyAccountMock = jest.fn();

jest.mock('@/hooks/useMyAccount', () => ({
  useMyAccount: () => useMyAccountMock(),
}));

describe('MyAccountForm', () => {
  const createHookState = (overrides?: Record<string, unknown>) => {
    return {
      form: {
        fullName: 'Cliente Teste',
        email: 'cliente@b8one.com',
        password: '',
        confirmPassword: '',
      },
      fieldErrors: {},
      message: null,
      isLoading: false,
      isSubmitting: false,
      canSubmit: true,
      setField: jest.fn(),
      submit: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useMyAccountMock.mockReturnValue(createHookState());
  });

  it('should render readonly name/email and submit profile updates', async () => {
    const hookState = createHookState();
    useMyAccountMock.mockReturnValue(hookState);

    render(<MyAccountForm />);

    const fullNameInput = screen.getByLabelText('Nome completo') as HTMLInputElement;
    expect(fullNameInput.readOnly).toBe(true);
    expect(fullNameInput.disabled).toBe(true);

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    expect(emailInput.readOnly).toBe(true);
    expect(emailInput.disabled).toBe(true);

    fireEvent.submit(screen.getByRole('button', { name: 'Salvar alterações' }).closest('form')!);

    await Promise.resolve();
    expect(hookState.submit).toHaveBeenCalledTimes(1);
  });

  it('should propagate password field changes through centralized hook', () => {
    const hookState = createHookState();
    useMyAccountMock.mockReturnValue(hookState);

    render(<MyAccountForm />);

    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'SenhaNova123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'SenhaNova123' },
    });

    expect(hookState.setField).toHaveBeenNthCalledWith(1, 'password', 'SenhaNova123');
    expect(hookState.setField).toHaveBeenNthCalledWith(2, 'confirmPassword', 'SenhaNova123');
  });

  it('should show message and keep submit disabled when canSubmit is false', () => {
    useMyAccountMock.mockReturnValue(
      createHookState({
        canSubmit: false,
        message: {
          level: 'error',
          text: 'Erro ao salvar',
        },
      }),
    );

    render(<MyAccountForm />);

    expect(screen.getByText('Erro ao salvar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('should render loading skeleton while fetching profile', () => {
    useMyAccountMock.mockReturnValue(
      createHookState({
        form: {
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        },
        isLoading: true,
        canSubmit: false,
      }),
    );

    render(<MyAccountForm />);
    expect(screen.getByText('Minha conta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeInTheDocument();
  });
});
