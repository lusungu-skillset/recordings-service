import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RecordingsModule } from './recordings/recordings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST') || 'mysql',
        port: config.get<number>('DB_PORT') || 3306,
        username: config.get<string>('DB_USERNAME') || 'recordings_service',
        password: config.get<string>('DB_PASSWORD') || 'secret_recordings',
        database: config.get<string>('DB_DATABASE') || 'recordingsdb',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // only for dev
        retryAttempts: 10,
        retryDelay: 5000,
      }),
    }),

    RecordingsModule,
  ],
})
export class AppModule {}
