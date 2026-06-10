import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3002;
  console.log(
    'MONGODB_URI:',
    process.env.MONGODB_URI ? 'Defined' : 'Undefined',
  );
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
