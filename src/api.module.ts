import AppConfig from '@/infrastructure/config/app.config';
import { ApiHealthModule } from '@/infrastructure/api-health/api-health.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { MetricsModule } from '@/infrastructure/metrics/metrics.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { AppointmentsModule } from '@/modules/appointments/appointments.module';
import { ExamsModule } from '@/modules/exams/exams.module';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [AppConfig] }),
    DatabaseModule,
    MetricsModule,
    ApiHealthModule,
    UsersModule,
    AuthModule,
    ExamsModule,
    AppointmentsModule,
  ],
})
export class ApiModule {}
