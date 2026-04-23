import { NotFoundException } from '@nestjs/common';
import { GetExamByIdUseCase } from '@/modules/exams/use-cases/get-exam-by-id.use-case';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import {
  makeAuthenticatedUser,
  makeExamEntity,
} from '../../../helpers/factories';

type Sut = {
  useCase: GetExamByIdUseCase;
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
    useCase: new GetExamByIdUseCase(examRepository),
    examRepository,
  };
}

describe('GetExamByIdUseCase', () => {
  it('uses findAnyById for admin user', async () => {
    const { useCase, examRepository } = createSut();
    const exam = makeExamEntity({ id: 'exam-id-1' });
    examRepository.findAnyById.mockResolvedValue(exam);

    const output = await useCase.execute({
      id: 'exam-id-1',
      user: makeAuthenticatedUser({ profile: UserProfile.ADMIN }),
    });

    expect(examRepository.findAnyById).toHaveBeenCalledWith('exam-id-1');
    expect(examRepository.findById).not.toHaveBeenCalled();
    expect(output).toBe(exam);
  });

  it('uses findById for client user', async () => {
    const { useCase, examRepository } = createSut();
    const exam = makeExamEntity({ id: 'exam-id-1' });
    examRepository.findById.mockResolvedValue(exam);

    const output = await useCase.execute({
      id: 'exam-id-1',
      user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
    });

    expect(examRepository.findById).toHaveBeenCalledWith('exam-id-1');
    expect(examRepository.findAnyById).not.toHaveBeenCalled();
    expect(output).toBe(exam);
  });

  it('throws NotFoundException when exam does not exist', async () => {
    const { useCase, examRepository } = createSut();
    examRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'missing-id',
        user: makeAuthenticatedUser({ profile: UserProfile.CLIENT }),
      }),
    ).rejects.toThrow(new NotFoundException('Exam not found'));
  });
});
