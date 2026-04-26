import { Permission } from '@/domain/commons/enums/permission.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';
import { ExamListSortBy } from '@/domain/commons/enums/exam-list-sort-by.enum';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { ICreateExamUseCase } from '@/domain/interfaces/use-cases/exams/create-exam.use-case';
import { IDeleteExamUseCase } from '@/domain/interfaces/use-cases/exams/delete-exam.use-case';
import { IGetExamByIdUseCase } from '@/domain/interfaces/use-cases/exams/get-exam-by-id.use-case';
import { IListAllExamsUseCase } from '@/domain/interfaces/use-cases/exams/list-all-exams.use-case';
import { IUpdateExamUseCase } from '@/domain/interfaces/use-cases/exams/update-exam.use-case';
import { IImportExamsCsvUseCase } from '@/domain/interfaces/use-cases/exams/import-exams-csv.use-case';
import { IExportExamsCsvUseCase } from '@/domain/interfaces/use-cases/exams/export-exams-csv.use-case';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { CurrentUser } from '@/infrastructure/http/decorators/current-user.decorator';
import { Permissions } from '@/infrastructure/http/decorators/permissions.decorator';
import { Profiles } from '@/infrastructure/http/decorators/profiles.decorator';
import { JwtAuthGuard } from '@/infrastructure/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/infrastructure/http/guards/permissions.guard';
import { ProfileGuard } from '@/infrastructure/http/guards/profile.guard';
import { ZodValidationPipe } from '@/infrastructure/http/pipes/zod.validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExamRequestDto } from '../dto/create-exam.request.dto';
import { ExamResponseDto } from '../dto/exam.response.dto';
import { ListExamsResponseDto } from '../dto/list-exams.response.dto';
import { UpdateExamRequestDto } from '../dto/update-exam.request.dto';
import { CsvImportRequestDto } from '@/modules/shared/dto/csv-import.request.dto';
import { CsvImportResponseDto } from '@/modules/shared/dto/csv-import.response.dto';
import { CsvExportResponseDto } from '@/modules/shared/dto/csv-export.response.dto';
import {
  CsvImportSchemaType,
  csvImportSchema,
} from '@/modules/shared/utils/csv-import.schema';
import { createExamSchema } from '../schemas/create-exam.schema';
import { examIdParamSchema } from '../schemas/exam-id-param.schema';
import {
  ListExamsQuerySchemaType,
  listExamsQuerySchema,
} from '../schemas/list-exams-query.schema';
import { updateExamSchema } from '../schemas/update-exam.schema';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(JwtAuthGuard, ProfileGuard, PermissionsGuard)
@Profiles(UserProfile.ADMIN, UserProfile.CLIENT)
export class ExamsController {
  constructor(
    @Inject(IGetExamByIdUseCase)
    private readonly getExamByIdUseCase: IGetExamByIdUseCase,
    @Inject(IListAllExamsUseCase)
    private readonly listAllExamsUseCase: IListAllExamsUseCase,
    @Inject(ICreateExamUseCase)
    private readonly createExamUseCase: ICreateExamUseCase,
    @Inject(IUpdateExamUseCase)
    private readonly updateExamUseCase: IUpdateExamUseCase,
    @Inject(IDeleteExamUseCase)
    private readonly deleteExamUseCase: IDeleteExamUseCase,
    @Inject(IImportExamsCsvUseCase)
    private readonly importExamsCsvUseCase: IImportExamsCsvUseCase,
    @Inject(IExportExamsCsvUseCase)
    private readonly exportExamsCsvUseCase: IExportExamsCsvUseCase,
  ) {}

  @Get('all')
  @Permissions(Permission.EXAMS_READ)
  @ApiOperation({ summary: 'List exams (admin: all, client: active only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ExamListSortBy,
    example: ExamListSortBy.CREATED_AT,
  })
  @ApiResponse({ status: 200, type: ListExamsResponseDto })
  async listAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listExamsQuerySchema))
    pagination: ListExamsQuerySchemaType,
  ): Promise<ListExamsResponseDto> {
    const result = await this.listAllExamsUseCase.execute(user, pagination);

    return {
      ...result,
      data: result.data.map((exam) => this.toResponse(exam)),
    };
  }

  @Get(':id')
  @Permissions(Permission.EXAMS_READ)
  @ApiOperation({ summary: 'Get exam details by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(examIdParamSchema))
    params: { id: string },
  ): Promise<ExamResponseDto> {
    const exam = await this.getExamByIdUseCase.execute({
      id: params.id,
      user,
    });

    return this.toResponse(exam);
  }

  @Post()
  @Permissions(Permission.EXAMS_CREATE)
  @ApiOperation({ summary: 'Create exam (admin only)' })
  @ApiBody({ type: CreateExamRequestDto })
  @ApiResponse({ status: 201, type: ExamResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createExamSchema))
    payload: {
      name: string;
      description?: string | null;
      durationMinutes: number;
      priceCents: number;
      availableWeekdays?: number[];
      availableStartTime?: string;
      availableEndTime?: string;
      availableFromDate?: string | null;
      availableToDate?: string | null;
    },
  ): Promise<ExamResponseDto> {
    const exam = await this.createExamUseCase.execute({
      user,
      ...payload,
    });
    return this.toResponse(exam);
  }

  @Post('import/csv')
  @Permissions(Permission.EXAMS_IMPORT_CSV)
  @ApiOperation({ summary: 'Import exams from CSV (admin only)' })
  @ApiBody({ type: CsvImportRequestDto })
  @ApiResponse({ status: 200, type: CsvImportResponseDto })
  async importCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(csvImportSchema))
    payload: CsvImportSchemaType,
  ): Promise<CsvImportResponseDto> {
    return this.importExamsCsvUseCase.execute({
      user,
      csvContent: payload.csvContent,
    });
  }

  @Get('export/csv')
  @Permissions(Permission.EXAMS_EXPORT_CSV)
  @ApiOperation({ summary: 'Export exams to CSV (admin only)' })
  @ApiResponse({ status: 200, type: CsvExportResponseDto })
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CsvExportResponseDto> {
    return this.exportExamsCsvUseCase.execute({ user });
  }

  @Patch(':id')
  @Permissions(Permission.EXAMS_UPDATE)
  @ApiOperation({ summary: 'Update exam (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateExamRequestDto })
  @ApiResponse({ status: 200, type: ExamResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(examIdParamSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(updateExamSchema))
    payload: {
      name?: string;
      description?: string | null;
      durationMinutes?: number;
      priceCents?: number;
      availableWeekdays?: number[];
      availableStartTime?: string;
      availableEndTime?: string;
      availableFromDate?: string | null;
      availableToDate?: string | null;
      isActive?: boolean;
    },
  ): Promise<ExamResponseDto> {
    const exam = await this.updateExamUseCase.execute({
      id: params.id,
      user,
      ...payload,
    });

    return this.toResponse(exam);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(Permission.EXAMS_DELETE)
  @ApiOperation({ summary: 'Delete exam (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(examIdParamSchema))
    params: { id: string },
  ): Promise<void> {
    await this.deleteExamUseCase.execute({
      id: params.id,
      user,
    });
  }

  private toResponse(exam: ExamEntity): ExamResponseDto {
    return {
      id: exam.id,
      name: exam.name,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      priceCents: exam.priceCents,
      availableWeekdays: exam.availableWeekdays,
      availableStartTime: exam.availableStartTime,
      availableEndTime: exam.availableEndTime,
      availableFromDate: exam.availableFromDate ?? null,
      availableToDate: exam.availableToDate ?? null,
    };
  }
}
