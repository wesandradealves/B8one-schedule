import AppConfig from '@/infrastructure/config/app.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './config/typeorm.options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(AppConfig()),
    }),
  ],
})
export class DatabaseModule {}
