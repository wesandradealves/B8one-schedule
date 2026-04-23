import { Permission } from '@/domain/commons/enums/permission.enum';
import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { UserEntity } from '@/domain/entities/user.entity';
import { ICreateUserUseCase } from '@/domain/interfaces/use-cases/users/create-user.use-case';
import { IDeleteUserUseCase } from '@/domain/interfaces/use-cases/users/delete-user.use-case';
import { IGetUserByIdUseCase } from '@/domain/interfaces/use-cases/users/get-user-by-id.use-case';
import { IListUsersUseCase } from '@/domain/interfaces/use-cases/users/list-users.use-case';
import { IUpdateUserUseCase } from '@/domain/interfaces/use-cases/users/update-user.use-case';
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
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import { ListUsersResponseDto } from '../dto/list-users.response.dto';
import { UpdateUserRequestDto } from '../dto/update-user.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import {
  PaginationQuerySchemaType,
  paginationQuerySchema,
} from '@/modules/shared/utils/pagination-query.schema';
import { createUserSchema } from '../schemas/create-user.schema';
import { updateUserSchema } from '../schemas/update-user.schema';
import { userIdParamSchema } from '../schemas/user-id-param.schema';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, ProfileGuard, PermissionsGuard)
@Profiles(UserProfile.ADMIN, UserProfile.CLIENT)
export class UsersController {
  constructor(
    @Inject(IListUsersUseCase)
    private readonly listUsersUseCase: IListUsersUseCase,
    @Inject(ICreateUserUseCase)
    private readonly createUserUseCase: ICreateUserUseCase,
    @Inject(IGetUserByIdUseCase)
    private readonly getUserByIdUseCase: IGetUserByIdUseCase,
    @Inject(IUpdateUserUseCase)
    private readonly updateUserUseCase: IUpdateUserUseCase,
    @Inject(IDeleteUserUseCase)
    private readonly deleteUserUseCase: IDeleteUserUseCase,
  ) {}

  @Get('all')
  @Permissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'List users (admin: all, client: own)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: ListUsersResponseDto })
  async listAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    pagination: PaginationQuerySchemaType,
  ): Promise<ListUsersResponseDto> {
    const result = await this.listUsersUseCase.execute(user, pagination);

    return {
      ...result,
      data: result.data.map((listedUser) => this.toResponse(listedUser)),
    };
  }

  @Post()
  @Permissions(Permission.USERS_CREATE)
  @ApiOperation({ summary: 'Create user (admin only)' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createUserSchema))
    payload: {
      fullName: string;
      email: string;
      password: string;
      profile: UserProfile;
      isActive?: boolean;
    },
  ): Promise<UserResponseDto> {
    const createdUser = await this.createUserUseCase.execute({
      user,
      ...payload,
    });
    return this.toResponse(createdUser);
  }

  @Get(':id')
  @Permissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Get user by id (admin: any, client: own)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(userIdParamSchema))
    params: { id: string },
  ): Promise<UserResponseDto> {
    const foundUser = await this.getUserByIdUseCase.execute({
      id: params.id,
      user,
    });

    return this.toResponse(foundUser);
  }

  @Patch(':id')
  @Permissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Update user (admin: any, client: own)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(userIdParamSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(updateUserSchema))
    payload: {
      fullName?: string;
      email?: string;
      password?: string;
      profile?: UserProfile;
      isActive?: boolean;
    },
  ): Promise<UserResponseDto> {
    const updatedUser = await this.updateUserUseCase.execute({
      id: params.id,
      user,
      ...payload,
    });
    return this.toResponse(updatedUser);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(Permission.USERS_DELETE)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(userIdParamSchema))
    params: { id: string },
  ): Promise<void> {
    await this.deleteUserUseCase.execute({
      id: params.id,
      user,
    });
  }

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profile: user.profile,
      isActive: user.isActive,
    };
  }
}
