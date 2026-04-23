import { isAdmin } from '@/domain/commons/utils/profile-authorization.util';
import { PaginationQuery } from '@/domain/commons/interfaces/pagination.interface';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { IListAllExamsUseCase } from '@/domain/interfaces/use-cases/exams/list-all-exams.use-case';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListAllExamsUseCase implements IListAllExamsUseCase {
  constructor(
    @Inject(IExamRepository)
    private readonly examRepository: IExamRepository,
  ) {}

  async execute(user: AuthenticatedUser, pagination: PaginationQuery) {
    if (isAdmin(user)) {
      return this.examRepository.listAll(pagination);
    }

    return this.examRepository.listActive(pagination);
  }
}
