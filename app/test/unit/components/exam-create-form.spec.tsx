import { fireEvent, render, screen } from '@testing-library/react';
import { ExamCreateForm } from '@/components/organisms/protected/exam-create-form';

const useCreateExamMock = jest.fn();

jest.mock('@/hooks/useCreateExam', () => ({
  useCreateExam: () => useCreateExamMock(),
}));

describe('ExamCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders restricted view for non-admin users', () => {
    useCreateExamMock.mockReturnValue({
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
      canManageExams: false,
      canSubmit: false,
      setField: jest.fn(),
      toggleWeekday: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
    });

    render(<ExamCreateForm />);

    expect(screen.getByText('Acesso restrito ao perfil administrador.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Criar exame' })).not.toBeInTheDocument();
  });

  it('renders and submits form', () => {
    const submit = jest.fn();
    const cancel = jest.fn();
    const setField = jest.fn();

    useCreateExamMock.mockReturnValue({
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
      fieldErrors: {},
      message: null,
      isSubmitting: false,
      canManageExams: true,
      canSubmit: true,
      setField,
      toggleWeekday: jest.fn(),
      submit,
      cancel,
    });

    render(<ExamCreateForm />);

    fireEvent.change(screen.getByLabelText('Nome do exame'), {
      target: { value: 'Vitamina D' },
    });
    expect(setField).toHaveBeenCalledWith('name', 'Vitamina D');

    fireEvent.click(screen.getByRole('button', { name: 'Criar exame' }));
    expect(submit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('renders inline message and errors', () => {
    useCreateExamMock.mockReturnValue({
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
      isSubmitting: false,
      canManageExams: true,
      canSubmit: false,
      setField: jest.fn(),
      toggleWeekday: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
    });

    render(<ExamCreateForm />);

    expect(screen.getByText('Falha ao criar exame')).toBeInTheDocument();
    expect(screen.getByText('Erro de nome')).toBeInTheDocument();
    expect(screen.getByText('Erro de duração')).toBeInTheDocument();
    expect(screen.getByText('Erro de disponibilidade')).toBeInTheDocument();
  });
});
