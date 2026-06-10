import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Serve static files from the 'uploads' directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  const port = process.env.PORT || 3002;
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Static files served from: http://localhost:${port}/uploads`);
}
bootstrap();
