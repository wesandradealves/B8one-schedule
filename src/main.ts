import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const port = Number(process.env.HTTP_PORT ?? 3000);

  app.setGlobalPrefix('api');
  await app.listen(port);

  new Logger('Bootstrap').log(`Application running on port ${port}`);
}

void bootstrap();

