import { DataSourceOptions } from 'typeorm';
import { AppConfigType } from '@/infrastructure/config/app.config';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { AuthTwoFactorEntity } from '@/domain/entities/auth.two-factor.entity';
import { ExamEntity } from '@/domain/entities/exam.entity';
import { UserEntity } from '@/domain/entities/user.entity';

export const buildTypeOrmOptions = (
  config: AppConfigType,
): DataSourceOptions => ({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl,
  synchronize: false,
  entities: [UserEntity, AuthTwoFactorEntity, ExamEntity, AppointmentEntity],
  migrations: ['dist/infrastructure/database/migrations/*.{ts,js}'],
});
