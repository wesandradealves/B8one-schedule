import { ListAllExamsUseCase } from '@/modules/exams/use-cases/list-all-exams.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: ListAllExamsUseCase;
  examRepository: jest.Mocked<IExamRepository>;
};

function createSut(): Sut {
  const examRepository: jest.Mocked<IExamRepository> = {
    listActive: jest.fn(),
    listAll: jest.fn(),
    findById: jest.fn(),
    findAnyById: jest.fn(),
    createExam: jest.fn(),
    updateExam: jest.fn(),
    deleteExam: jest.fn(),
  };

  return {
    useCase: new ListAllExamsUseCase(examRepository),
    examRepository,
  };
}

describe('ListAllExamsUseCase', () => {
  it('returns listAll for admin', async () => {
    const { useCase, examRepository } = createSut();
    const pagination = { page: 1, limit: 10 };

    examRepository.listAll.mockResolvedValue({
      data: [makeExamEntity({ id: 'exam-id-1' })],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
      pagination,
    );

    expect(examRepository.listAll).toHaveBeenCalledWith(pagination);
    expect(examRepository.listActive).not.toHaveBeenCalled();
    expect(output.total).toBe(1);
  });

  it('returns listActive for client', async () => {
    const { useCase, examRepository } = createSut();
    const pagination = { page: 2, limit: 5 };

    examRepository.listActive.mockResolvedValue({
      data: [makeExamEntity({ id: 'exam-id-1' })],
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
    });

    const output = await useCase.execute(
      makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      pagination,
    );

    expect(examRepository.listActive).toHaveBeenCalledWith(pagination);
    expect(examRepository.listAll).not.toHaveBeenCalled();
    expect(output.page).toBe(2);
  });
});
