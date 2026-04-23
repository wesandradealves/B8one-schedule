import { UserEntity } from '@/domain/entities/user.entity';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { ICreateUserUseCase } from '@/domain/interfaces/use-cases/users/create-user.use-case';
import { IDeleteUserUseCase } from '@/domain/interfaces/use-cases/users/delete-user.use-case';
import { IGetUserByIdUseCase } from '@/domain/interfaces/use-cases/users/get-user-by-id.use-case';
import { IListUsersUseCase } from '@/domain/interfaces/use-cases/users/list-users.use-case';
import { IUpdateUserUseCase } from '@/domain/interfaces/use-cases/users/update-user.use-case';
import { HashModule } from '@/infrastructure/providers/hash/hash.module';
import { BullMqMessagingModule } from '@/infrastructure/providers/messaging/bullmq/bullmq.module';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './api/controllers/users.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from './use-cases/list-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    SharedModule,
    HashModule,
    BullMqMessagingModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IListUsersUseCase,
      useClass: ListUsersUseCase,
    },
    {
      provide: ICreateUserUseCase,
      useClass: CreateUserUseCase,
    },
    {
      provide: IGetUserByIdUseCase,
      useClass: GetUserByIdUseCase,
    },
    {
      provide: IUpdateUserUseCase,
      useClass: UpdateUserUseCase,
    },
    {
      provide: IDeleteUserUseCase,
      useClass: DeleteUserUseCase,
    },
  ],
  exports: [IUserRepository],
})
export class UsersModule {}
