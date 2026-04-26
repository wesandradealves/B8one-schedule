import { fireEvent, render, screen } from '@testing-library/react';
import { ExamCreateForm } from '@/components/organisms/protected/exam-create-form';

const useCreateExamMock = jest.fn();

jest.mock('@/hooks/useCreateExam', () => ({
  useCreateExam: () => useCreateExamMock(),
}));

const createMockValue = (overrides: Record<string, unknown> = {}) => ({
  form: {
    name: '',
    description: '',
    durationMinutes: '20',
    priceCents: '',
    availableWeekdays: [1, 2, 3, 4, 5],
    availableStartTime: '07:00',
    availableEndTime: '19:00',
    availableFromDate: '',
    availableToDate: '',
  },
  fieldErrors: {},
  message: null,
  isSubmitting: false,
  canManageExams: true,
  canSubmit: true,
  setField: jest.fn(),
  toggleWeekday: jest.fn(),
  submit: jest.fn(),
  cancel: jest.fn(),
  ...overrides,
});

describe('ExamCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders restricted view for non-admin users', () => {
    useCreateExamMock.mockReturnValue(createMockValue({ canManageExams: false, canSubmit: false }));

    render(<ExamCreateForm />);

    expect(screen.getByText('Acesso restrito ao perfil administrador.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar exame' })).not.toBeInTheDocument();
  });

  it('renders and submits form', () => {
    const submit = jest.fn();
    const cancel = jest.fn();
    const setField = jest.fn();
    const toggleWeekday = jest.fn();

    useCreateExamMock.mockReturnValue(createMockValue({
      form: {
        name: 'Hemograma',
        description: 'Exame laboratorial',
        durationMinutes: '30',
        priceCents: '12000',
        availableWeekdays: [1, 2, 3, 4, 5],
        availableStartTime: '07:00',
        availableEndTime: '19:00',
        availableFromDate: '',
        availableToDate: '',
      },
      setField,
      toggleWeekday,
      submit,
      cancel,
    }));

    render(<ExamCreateForm />);

    fireEvent.change(screen.getByLabelText('Nome do exame'), {
      target: { value: 'Vitamina D' },
    });
    expect(setField).toHaveBeenCalledWith('name', 'Vitamina D');

    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Descrição teste' },
    });
    expect(setField).toHaveBeenCalledWith('description', 'Descrição teste');

    fireEvent.change(screen.getByLabelText('Duração (minutos)'), {
      target: { value: '25' },
    });
    expect(setField).toHaveBeenCalledWith('durationMinutes', '25');

    fireEvent.change(screen.getByLabelText('Valor (centavos)'), {
      target: { value: '3000' },
    });
    expect(setField).toHaveBeenCalledWith('priceCents', '3000');

    fireEvent.change(screen.getByLabelText('Horário inicial'), {
      target: { value: '08:00' },
    });
    expect(setField).toHaveBeenCalledWith('availableStartTime', '08:00');

    fireEvent.change(screen.getByLabelText('Horário final'), {
      target: { value: '18:00' },
    });
    expect(setField).toHaveBeenCalledWith('availableEndTime', '18:00');

    fireEvent.change(screen.getByLabelText('Disponível a partir de'), {
      target: { value: '2026-04-25' },
    });
    expect(setField).toHaveBeenCalledWith('availableFromDate', '2026-04-25');

    fireEvent.change(screen.getByLabelText('Disponível até'), {
      target: { value: '2026-05-25' },
    });
    expect(setField).toHaveBeenCalledWith('availableToDate', '2026-05-25');

    fireEvent.click(screen.getByLabelText('Sáb'));
    expect(toggleWeekday).toHaveBeenCalledWith(6, true);

    fireEvent.click(screen.getByRole('button', { name: 'Criar exame' }));
    expect(submit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('renders inline message and errors', () => {
    useCreateExamMock.mockReturnValue(createMockValue({
      form: {
        name: '',
        description: '',
        durationMinutes: '0',
        priceCents: '0',
        availableWeekdays: [],
        availableStartTime: '',
        availableEndTime: '',
        availableFromDate: '',
        availableToDate: '',
      },
      fieldErrors: {
        name: 'Erro de nome',
        durationMinutes: 'Erro de duração',
        availableWeekdays: 'Erro de disponibilidade',
      },
      message: {
        level: 'error',
        text: 'Falha ao criar exame',
      },
      canSubmit: false,
    }));

    render(<ExamCreateForm />);

    expect(screen.getByText('Falha ao criar exame')).toBeInTheDocument();
    expect(screen.getByText('Erro de nome')).toBeInTheDocument();
    expect(screen.getByText('Erro de duração')).toBeInTheDocument();
    expect(screen.getByText('Erro de disponibilidade')).toBeInTheDocument();
  });

  it('disables actions while submitting', () => {
    useCreateExamMock.mockReturnValue(
      createMockValue({
        isSubmitting: true,
        canSubmit: false,
      }),
    );

    render(<ExamCreateForm />);

    expect(screen.getByRole('button', { name: 'Criar exame' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
