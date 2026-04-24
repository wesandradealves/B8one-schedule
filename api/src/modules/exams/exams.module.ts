import { ExamEntity } from '@/domain/entities/exam.entity';
import { IExamRepository } from '@/domain/interfaces/repositories/exam.repository';
import { ICreateExamUseCase } from '@/domain/interfaces/use-cases/exams/create-exam.use-case';
import { IDeleteExamUseCase } from '@/domain/interfaces/use-cases/exams/delete-exam.use-case';
import { IGetExamByIdUseCase } from '@/domain/interfaces/use-cases/exams/get-exam-by-id.use-case';
import { IListAllExamsUseCase } from '@/domain/interfaces/use-cases/exams/list-all-exams.use-case';
import { IUpdateExamUseCase } from '@/domain/interfaces/use-cases/exams/update-exam.use-case';
import { IImportExamsCsvUseCase } from '@/domain/interfaces/use-cases/exams/import-exams-csv.use-case';
import { IExportExamsCsvUseCase } from '@/domain/interfaces/use-cases/exams/export-exams-csv.use-case';
import { BullMqMessagingModule } from '@/infrastructure/providers/messaging/bullmq/bullmq.module';
import { RedisCacheModule } from '@/infrastructure/providers/cache/redis/redis-cache.module';
import { ExamRepository } from '@/infrastructure/repositories/exam.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { ExamsController } from './api/controllers/exams.controller';
import { CreateExamUseCase } from './use-cases/create-exam.use-case';
import { DeleteExamUseCase } from './use-cases/delete-exam.use-case';
import { GetExamByIdUseCase } from './use-cases/get-exam-by-id.use-case';
import { ListAllExamsUseCase } from './use-cases/list-all-exams.use-case';
import { UpdateExamUseCase } from './use-cases/update-exam.use-case';
import { ImportExamsCsvUseCase } from './use-cases/import-exams-csv.use-case';
import { ExportExamsCsvUseCase } from './use-cases/export-exams-csv.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamEntity]),
    BullMqMessagingModule,
    RedisCacheModule,
    SharedModule,
  ],
  controllers: [ExamsController],
  providers: [
    {
      provide: IExamRepository,
      useClass: ExamRepository,
    },
    {
      provide: IGetExamByIdUseCase,
      useClass: GetExamByIdUseCase,
    },
    {
      provide: IListAllExamsUseCase,
      useClass: ListAllExamsUseCase,
    },
    {
      provide: ICreateExamUseCase,
      useClass: CreateExamUseCase,
    },
    {
      provide: IUpdateExamUseCase,
      useClass: UpdateExamUseCase,
    },
    {
      provide: IDeleteExamUseCase,
      useClass: DeleteExamUseCase,
    },
    {
      provide: IImportExamsCsvUseCase,
      useClass: ImportExamsCsvUseCase,
    },
    {
      provide: IExportExamsCsvUseCase,
      useClass: ExportExamsCsvUseCase,
    },
  ],
  exports: [IExamRepository],
})
export class ExamsModule {}
