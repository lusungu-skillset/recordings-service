import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'crypto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  (global as any).crypto = crypto;

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || '*', // allow multiple origins if comma-separated
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
  });

  const port = process.env.PORT || 7003;
  await app.listen(port, '0.0.0.0'); // ✅ 0.0.0.0 makes it reachable inside Docker
  console.log(`🚀 Recordings service running on port ${port}`);
}
bootstrap();
