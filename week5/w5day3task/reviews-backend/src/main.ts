import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set prefix for APIs
  app.setGlobalPrefix('api');

  const port = process.env.REVIEWS_PORT || 3000;
  await app.listen(port);
  console.log(`NestJS Reviews & Notifications backend is running on: http://localhost:${port}/api`);
}
bootstrap();
