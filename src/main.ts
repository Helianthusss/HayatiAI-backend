import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
      forbidNonWhitelisted: true, 
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