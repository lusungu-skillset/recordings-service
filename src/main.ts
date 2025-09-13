import * as nodeCrypto from 'crypto';


if (!(global as any).crypto) {
  (global as any).crypto = nodeCrypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Enable CORS
  app.enableCors({
    origin: "http://localhost:5173",  // frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Redis microservice setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  // Start both HTTP and Redis listeners
  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
