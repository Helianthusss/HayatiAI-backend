import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Chỉ cho phép các properties đã được định nghĩa
      transform: true, // Tự động transform types
      forbidNonWhitelisted: true, // Throw error nếu có properties không được định nghĩa
    }),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('API documentation for authentication system')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();