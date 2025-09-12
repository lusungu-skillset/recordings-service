import * as nodeCrypto from 'crypto';


if (!(global as any).crypto) {
  (global as any).crypto = nodeCrypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
