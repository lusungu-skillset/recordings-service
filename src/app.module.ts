import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Recording } from './recordings/recordings.entity';
import { RecordingsController } from './recordings/recordings.controller';
import { RecordingsService } from './recordings/recordings.service';


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
        entities: [Recording],
        synchronize: true, // ⚠️ dev only
      }),
    }),
  ],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class AppModule {}
