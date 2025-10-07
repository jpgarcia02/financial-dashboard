import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS básico
  app.enableCors();

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Prefijo /api para todas las rutas
  app.setGlobalPrefix('api');

  // Swagger (documentación)
  const config = new DocumentBuilder()
    .setTitle('Financial Dashboard API')
    .setDescription('API para gestión financiera personal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  
  console.log('🚀 API corriendo en: http://localhost:3000');
  console.log('📚 Swagger: http://localhost:3000/api/docs');
}

bootstrap();