import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import {
  cancelAppointmentById,
  createAppointment,
  deleteAppointmentById,
  exportAppointmentsCsv,
  importAppointmentsCsv,
  listAppointmentAvailability,
  listAppointments,
  updateAppointmentById,
} from '@/services/appointments.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('appointments service', () => {
  const mockedApi = api as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list appointments with pagination params', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    const params = { page: 3, limit: 15, sortBy: 'status' as const, sortOrder: 'ASC' as const };
    await listAppointments(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/appointments/all', { params });
  });

  it('should create appointment through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({ id: '1' });

    const payload = { examId: 'exam-1', scheduledAt: '2026-04-30T10:00:00.000Z' };
    await createAppointment(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/appointments', payload);
  });

  it('should list appointment availability through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue([]);

    const params = {
      examId: 'exam-1',
      startsAt: '2026-05-01T00:00:00.000Z',
      endsAt: '2026-05-07T23:59:59.999Z',
    };

    await listAppointmentAvailability(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/appointments/availability', { params });
  });

  it('should list appointments with empty params by default', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await listAppointments();

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/appointments/all', { params: {} });
  });

  it('should pass scheduledDate filter when listing appointments', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 8,
      total: 0,
      totalPages: 0,
    });

    const params = {
      page: 1,
      limit: 8,
      scheduledDate: '2026-05-01',
      sortBy: 'scheduledAt' as const,
      sortOrder: 'DESC' as const,
    };
    await listAppointments(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/appointments/all', { params });
  });

  it('should update appointment through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'SCHEDULED',
    });

    const payload = {
      scheduledAt: '2026-05-01T10:00:00.000Z',
      notes: 'Teste',
      status: 'SCHEDULED' as const,
    };

    await updateAppointmentById('appointment-1', payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.patch).toHaveBeenCalledWith('/appointments/appointment-1', payload);
  });

  it('should cancel appointment through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      status: 'CANCELLED',
    });

    await cancelAppointmentById('appointment-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.patch).toHaveBeenCalledWith('/appointments/appointment-1/cancel');
  });

  it('should delete appointment through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteAppointmentById('appointment-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.delete).toHaveBeenCalledWith('/appointments/appointment-1');
  });

  it('should import appointments csv through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    await importAppointmentsCsv(
      'userId,examId,scheduledAt\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z',
    );

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/appointments/import/csv', {
      csvContent: 'userId,examId,scheduledAt\nuser-id-1,exam-id-1,2099-01-01T10:00:00.000Z',
    });
  });

  it('should export appointments csv through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      fileName: 'appointments.csv',
      csvContent: 'userId,examId,scheduledAt',
    });

    await exportAppointmentsCsv();

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/appointments/export/csv');
  });
});
