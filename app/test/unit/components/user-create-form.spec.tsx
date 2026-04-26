import { fireEvent, render, screen } from '@testing-library/react';
import { UserCreateForm } from '@/components/organisms/protected/user-create-form';

const useCreateUserMock = jest.fn();

jest.mock('@/hooks/useCreateUser', () => ({
  useCreateUser: () => useCreateUserMock(),
}));

const createMockValue = (overrides: Record<string, unknown> = {}) => ({
  form: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: 'CLIENT',
  },
  fieldErrors: {},
  message: null,
  isSubmitting: false,
  canManageUsers: true,
  canSubmit: true,
  setField: jest.fn(),
  submit: jest.fn(),
  cancel: jest.fn(),
  ...overrides,
});

describe('UserCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders restricted view for non-admin users', () => {
    useCreateUserMock.mockReturnValue(createMockValue({ canManageUsers: false, canSubmit: false }));

    render(<UserCreateForm />);

    expect(screen.getByText('Acesso restrito ao perfil administrador.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar usuário' })).not.toBeInTheDocument();
  });

  it('renders and submits form', () => {
    const submit = jest.fn();
    const cancel = jest.fn();
    const setField = jest.fn();

    useCreateUserMock.mockReturnValue(createMockValue({
      form: {
        fullName: 'Novo Usuário',
        email: 'novo@b8one.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
        profile: 'CLIENT',
      },
      setField,
      submit,
      cancel,
    }));

    render(<UserCreateForm />);

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Teste' },
    });
    expect(setField).toHaveBeenCalledWith('fullName', 'Teste');

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'teste@empresa.com' },
    });
    expect(setField).toHaveBeenCalledWith('email', 'teste@empresa.com');

    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Senha1234' },
    });
    expect(setField).toHaveBeenCalledWith('password', 'Senha1234');

    fireEvent.change(screen.getByLabelText('Confirmar senha'), {
      target: { value: 'Senha1234' },
    });
    expect(setField).toHaveBeenCalledWith('confirmPassword', 'Senha1234');

    fireEvent.change(screen.getByLabelText('Perfil'), {
      target: { value: 'ADMIN' },
    });
    expect(setField).toHaveBeenCalledWith('profile', 'ADMIN');

    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));
    expect(submit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('renders inline message and errors', () => {
    useCreateUserMock.mockReturnValue(createMockValue({
      fieldErrors: {
        fullName: 'Erro de nome',
        email: 'Erro de email',
      },
      message: {
        level: 'error',
        text: 'Falha ao criar usuário',
      },
      canSubmit: false,
    }));

    render(<UserCreateForm />);

    expect(screen.getByText('Falha ao criar usuário')).toBeInTheDocument();
    expect(screen.getByText('Erro de nome')).toBeInTheDocument();
    expect(screen.getByText('Erro de email')).toBeInTheDocument();
  });

  it('disables actions while submitting', () => {
    useCreateUserMock.mockReturnValue(
      createMockValue({
        isSubmitting: true,
        canSubmit: false,
      }),
    );

    render(<UserCreateForm />);

    expect(screen.getByRole('button', { name: 'Criar usuário' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
