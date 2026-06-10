import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { NestExpressApplication } from '@nestjs/platform-express';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });
  
  // Required for Railway/Render/Vercel/Heroku proxies to correctly handle HTTPS and cookies
  app.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Crucial for receiving cookies
  });

  app.use(cookieParser());
  
  // Required by Passport to track state during OAuth redirects and prevent CSRF
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'ecommerce-social-login-secret-replace-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    }),
  );

  await app.listen(process.env.PORT ?? 4000); // Port 4000 to avoid conflict with Next.js
}
bootstrap();
