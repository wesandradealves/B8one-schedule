import { fireEvent, render, screen } from '@testing-library/react';
import { UserCreateForm } from '@/components/organisms/protected/user-create-form';

const useCreateUserMock = jest.fn();

jest.mock('@/hooks/useCreateUser', () => ({
  useCreateUser: () => useCreateUserMock(),
}));

describe('UserCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders restricted view for non-admin users', () => {
    useCreateUserMock.mockReturnValue({
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
      canManageUsers: false,
      canSubmit: false,
      setField: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
    });

    render(<UserCreateForm />);

    expect(screen.getByText('Acesso restrito ao perfil administrador.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar usuário' })).not.toBeInTheDocument();
  });

  it('renders and submits form', () => {
    const submit = jest.fn();
    const cancel = jest.fn();
    const setField = jest.fn();

    useCreateUserMock.mockReturnValue({
      form: {
        fullName: 'Novo Usuário',
        email: 'novo@b8one.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
        profile: 'CLIENT',
      },
      fieldErrors: {},
      message: null,
      isSubmitting: false,
      canManageUsers: true,
      canSubmit: true,
      setField,
      submit,
      cancel,
    });

    render(<UserCreateForm />);

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Teste' },
    });
    expect(setField).toHaveBeenCalledWith('fullName', 'Teste');

    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));
    expect(submit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('renders inline message and errors', () => {
    useCreateUserMock.mockReturnValue({
      form: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        profile: 'CLIENT',
      },
      fieldErrors: {
        fullName: 'Erro de nome',
        email: 'Erro de email',
      },
      message: {
        level: 'error',
        text: 'Falha ao criar usuário',
      },
      isSubmitting: false,
      canManageUsers: true,
      canSubmit: false,
      setField: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
    });

    render(<UserCreateForm />);

    expect(screen.getByText('Falha ao criar usuário')).toBeInTheDocument();
    expect(screen.getByText('Erro de nome')).toBeInTheDocument();
    expect(screen.getByText('Erro de email')).toBeInTheDocument();
  });
});
