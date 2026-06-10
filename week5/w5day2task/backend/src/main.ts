import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend requests
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Set global API prefix so routes are /api/...
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log('NestJS Backend is running on: http://localhost:3001/api');
}
bootstrap();
