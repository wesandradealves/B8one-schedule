import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { setupSwagger } from '@/infrastructure/swagger/swagger.setup';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '@/infrastructure/http/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    logger: ['debug', 'error', 'log', 'verbose', 'warn'],
  });
  const configService = app.get(ConfigService);
  const port = Number(configService.get<number>('application.port', 3000));
  const apiPrefix = configService.get<string>('application.apiPrefix', '').trim();

  app.enableCors({ origin: '*' });
  app.useGlobalFilters(new HttpExceptionFilter());

  if (apiPrefix.length > 0) {
    app.setGlobalPrefix(apiPrefix, {
      exclude: ['health', 'metrics'],
    });
  }

  setupSwagger(app);

  await app.listen(port);

  new Logger('Bootstrap').log(`Application running on port ${port}`);
}

void bootstrap();
