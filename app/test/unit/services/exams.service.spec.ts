import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import {
  deleteExamById,
  getExamById,
  listExams,
  updateExamById,
} from '@/services/exams.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('exams service', () => {
  const mockedApi = api as unknown as {
    get: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list exams using paginated all endpoint', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    const params = { page: 2, limit: 20, search: 'cardio' };
    await listExams(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/exams/all', { params });
  });

  it('should fetch exam details by id', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Exame',
      description: null,
      durationMinutes: 30,
      priceCents: 1000,
    });

    await getExamById('exam-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/exams/exam-1');
  });

  it('should list exams with empty params by default', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await listExams();

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/exams/all', { params: {} });
  });

  it('should update exam by id through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: 'exam-1',
      name: 'Exame atualizado',
      description: 'Descrição',
      durationMinutes: 45,
      priceCents: 15000,
    });

    const payload = {
      name: 'Exame atualizado',
      description: 'Descrição',
      durationMinutes: 45,
      priceCents: 15000,
    };

    await updateExamById('exam-1', payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.patch).toHaveBeenCalledWith('/exams/exam-1', payload);
  });

  it('should delete exam by id through centralized request flow', async () => {
    (executeRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteExamById('exam-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.delete).toHaveBeenCalledWith('/exams/exam-1');
  });
});
