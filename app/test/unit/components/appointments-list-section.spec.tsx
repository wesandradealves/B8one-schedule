import { fireEvent, render, screen, within } from '@testing-library/react';
import { AppointmentsListSection } from '@/components/organisms/protected/appointments-list-section';

const useAppointmentsListMock = jest.fn();

jest.mock('@/hooks/useAppointmentsList', () => ({
  useAppointmentsList: () => useAppointmentsListMock(),
}));

describe('AppointmentsListSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter and list rows', () => {
    const updateScheduledDateFilter = jest.fn();

    useAppointmentsListMock.mockReturnValue({
      appointments: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: 'Observação',
          status: 'SCHEDULED',
          changeStatus: 'NONE',
          userFullName: 'Cliente Teste',
          userEmail: 'cliente@b8one.com',
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: false,
      canCancelAppointments: true,
      editingAppointmentId: null,
      editForm: null,
      setPage: jest.fn(),
      updateScheduledDateFilter,
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      cancelAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    });

    render(<AppointmentsListSection />);

    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Data'), {
      target: { value: '2026-05-01' },
    });
    expect(updateScheduledDateFilter).toHaveBeenCalledWith('2026-05-01');
  });

  it('should render admin actions and callbacks', () => {
    const startEdit = jest.fn();
    const deleteAppointment = jest.fn();
    const cancelAppointment = jest.fn();

    useAppointmentsListMock.mockReturnValue({
      appointments: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: true,
      canCancelAppointments: true,
      editingAppointmentId: null,
      editForm: null,
      setPage: jest.fn(),
      updateScheduledDateFilter: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit,
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      cancelAppointment,
      deleteAppointment,
    });

    render(<AppointmentsListSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(startEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Confirmar exclusão')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(deleteAppointment).toHaveBeenCalledWith('appt-1');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    const cancelDialog = screen.getByRole('dialog');
    expect(within(cancelDialog).getByText('Confirmar cancelamento')).toBeInTheDocument();

    fireEvent.click(within(cancelDialog).getByRole('button', { name: 'Confirmar' }));
    expect(cancelAppointment).toHaveBeenCalledWith('appt-1');
  });

  it('should close appointment confirmation dialog on cancel', () => {
    useAppointmentsListMock.mockReturnValue({
      appointments: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: true,
      canCancelAppointments: true,
      editingAppointmentId: null,
      editForm: null,
      setPage: jest.fn(),
      updateScheduledDateFilter: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      cancelAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    });

    render(<AppointmentsListSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render edit mode controls', () => {
    const saveEdit = jest.fn();
    const cancelEdit = jest.fn();

    useAppointmentsListMock.mockReturnValue({
      appointments: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: true,
      canCancelAppointments: true,
      editingAppointmentId: 'appt-1',
      editForm: {
        scheduledAt: '2026-05-01T10:00',
        notes: 'Notas',
        status: 'SCHEDULED',
      },
      setPage: jest.fn(),
      updateScheduledDateFilter: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit,
      setEditField: jest.fn(),
      saveEdit,
      cancelAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    });

    render(<AppointmentsListSection />);

    expect(screen.getByLabelText('Data e hora do agendamento')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(saveEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });

  it('should dispatch sort changes', () => {
    const updateSortOrder = jest.fn();

    useAppointmentsListMock.mockReturnValue({
      appointments: [],
      page: 1,
      total: 0,
      totalPages: 0,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: true,
      canCancelAppointments: true,
      editingAppointmentId: null,
      editForm: null,
      setPage: jest.fn(),
      updateScheduledDateFilter: jest.fn(),
      updateSortOrder,
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      cancelAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    });

    render(<AppointmentsListSection />);

    fireEvent.change(screen.getByLabelText('Ordenar'), {
      target: { value: 'ASC' },
    });

    expect(updateSortOrder).toHaveBeenCalledWith('ASC');
  });

  it('should allow non-admin users to cancel own appointments', () => {
    const cancelAppointment = jest.fn();

    useAppointmentsListMock.mockReturnValue({
      appointments: [
        {
          id: 'appt-1',
          userId: 'user-1',
          examId: 'exam-1',
          examName: 'Hemograma',
          scheduledAt: '2026-05-01T10:00:00.000Z',
          notes: null,
          status: 'SCHEDULED',
          changeStatus: 'NONE',
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      scheduledDateFilter: '',
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageAppointments: false,
      canCancelAppointments: true,
      editingAppointmentId: null,
      editForm: null,
      setPage: jest.fn(),
      updateScheduledDateFilter: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      cancelAppointment,
      deleteAppointment: jest.fn(),
    });

    render(<AppointmentsListSection />);

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));
    expect(cancelAppointment).toHaveBeenCalledWith('appt-1');
  });
});
