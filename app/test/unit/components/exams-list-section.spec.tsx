import { fireEvent, render, screen, within } from '@testing-library/react';
import { ExamsListSection } from '@/components/organisms/protected/exams-list-section';

const useExamsListMock = jest.fn();

jest.mock('@/hooks/useExamsList', () => ({
  useExamsList: () => useExamsListMock(),
}));

describe('ExamsListSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list without admin actions when user cannot manage exams', () => {
    useExamsListMock.mockReturnValue({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      isLoading: false,
      isSaving: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      canManageExams: false,
      editingExamId: null,
      editForm: null,
      setPage: jest.fn(),
      updateSortBy: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteExam: jest.fn(),
      isImportingCsv: false,
      isExportingCsv: false,
      isCsvBusy: false,
      importCsvFile: jest.fn(),
      exportCsvFile: jest.fn(),
    });

    render(<ExamsListSection />);

    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Adicionar exame' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Importar CSV' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument();
  });

  it('should render admin actions and dispatch callbacks', () => {
    const startEdit = jest.fn();
    const deleteExam = jest.fn();

    useExamsListMock.mockReturnValue({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      isLoading: false,
      isSaving: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      canManageExams: true,
      editingExamId: null,
      editForm: null,
      setPage: jest.fn(),
      updateSortBy: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit,
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteExam,
      isImportingCsv: false,
      isExportingCsv: false,
      isCsvBusy: false,
      importCsvFile: jest.fn(),
      exportCsvFile: jest.fn(),
    });

    render(<ExamsListSection />);

    expect(screen.getByRole('link', { name: 'Adicionar exame' })).toHaveAttribute(
      'href',
      '/app/exams/new',
    );
    expect(screen.getByRole('button', { name: 'Importar CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(startEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Confirmar exclusão')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(deleteExam).toHaveBeenCalledWith('exam-1');
  });

  it('should close confirmation dialog when cancel is clicked', () => {
    useExamsListMock.mockReturnValue({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      isLoading: false,
      isSaving: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      canManageExams: true,
      editingExamId: null,
      editForm: null,
      setPage: jest.fn(),
      updateSortBy: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteExam: jest.fn(),
      isImportingCsv: false,
      isExportingCsv: false,
      isCsvBusy: false,
      importCsvFile: jest.fn(),
      exportCsvFile: jest.fn(),
    });

    render(<ExamsListSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render edit controls when exam is being edited', () => {
    const saveEdit = jest.fn();
    const cancelEdit = jest.fn();

    useExamsListMock.mockReturnValue({
      exams: [
        {
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 10000,
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      isLoading: false,
      isSaving: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      canManageExams: true,
      editingExamId: 'exam-1',
      editForm: {
        name: 'Hemograma Atualizado',
        description: 'Descrição',
        durationMinutes: '45',
        priceCents: '15000',
      },
      setPage: jest.fn(),
      updateSortBy: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit,
      setEditField: jest.fn(),
      saveEdit,
      deleteExam: jest.fn(),
      isImportingCsv: false,
      isExportingCsv: false,
      isCsvBusy: false,
      importCsvFile: jest.fn(),
      exportCsvFile: jest.fn(),
    });

    render(<ExamsListSection />);

    expect(screen.getByLabelText('Nome do exame')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(saveEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });

  it('should dispatch sort changes', () => {
    const updateSortBy = jest.fn();
    const updateSortOrder = jest.fn();

    useExamsListMock.mockReturnValue({
      exams: [],
      page: 1,
      total: 0,
      totalPages: 0,
      isLoading: false,
      isSaving: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      canManageExams: true,
      editingExamId: null,
      editForm: null,
      setPage: jest.fn(),
      updateSortBy,
      updateSortOrder,
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteExam: jest.fn(),
      isImportingCsv: false,
      isExportingCsv: false,
      isCsvBusy: false,
      importCsvFile: jest.fn(),
      exportCsvFile: jest.fn(),
    });

    render(<ExamsListSection />);

    fireEvent.change(screen.getByLabelText('Filtrar'), {
      target: { value: 'priceCents' },
    });

    expect(updateSortBy).toHaveBeenCalledWith('priceCents');

    fireEvent.change(screen.getByLabelText('Ordem dos resultados'), {
      target: { value: 'ASC' },
    });

    expect(updateSortOrder).toHaveBeenCalledWith('ASC');
  });
});
