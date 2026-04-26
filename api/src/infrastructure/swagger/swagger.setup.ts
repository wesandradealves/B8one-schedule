import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('B8one API')
    .setDescription('Backend API for exams and appointments')
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication and account lifecycle')
    .addTag('Users', 'User management')
    .addTag('Exams', 'Exam catalog management')
    .addTag('Appointments', 'Appointment scheduling and approval')
    .addTag('Infrastructure', 'Operational endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};
