import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        
      forbidNonWhitelisted: false,
      transform: true,        
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
 
  const authService = app.get(AuthService);
  await authService.seedAdmin();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}/api`); 
}
bootstrap();
