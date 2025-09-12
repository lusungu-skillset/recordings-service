import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RecordingsModule } from './recordings/recordings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'mysql',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'eduvibe',
        password: process.env.DB_PASSWORD || 'eduvibe-lms',
        database: process.env.DB_NAME_USERS || 'recordingsdb',
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Use glob pattern for flexibility
        synchronize: true, // ⚠️ Set to false in production
      }),
    }),
    RecordingsModule,
  ],
  controllers: [], // Remove RecordingsController
  providers: [], // Remove RecordingsService
})
export class AppModule {}