import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import { createAppointment, listAppointments } from '@/services/appointments.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('appointments service', () => {
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

    const params = { page: 3, limit: 15 };
    await listAppointments(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect((api as any).get).toHaveBeenCalledWith('/appointments/all', { params });
  });

  it('should create appointment through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({ id: '1' });

    const payload = { examId: 'exam-1', scheduledAt: '2026-04-30T10:00:00.000Z' };
    await createAppointment(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect((api as any).post).toHaveBeenCalledWith('/appointments', payload);
  });
});
