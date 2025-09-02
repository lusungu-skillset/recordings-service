import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Recording } from './recordings/recordings.entities';
import { RecordingsController } from './app.controller';
import { RecordingsService } from './app.service';


@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'mysql'),
        port: configService.get<number>('MYSQL_PORT', 3306),
        username: configService.get('MYSQL_USER', 'eduvibe'),
        password: configService.get('MYSQL_PASSWORD', 'eduvibe-lms'),
        database: configService.get('MYSQL_DB', 'recordingsdb'),
        entities: [Recording],
        synchronize: true,
        retryAttempts: 10, // Increased retry attempts
        retryDelay: 3000, // 3 seconds between retries
        autoLoadEntities: true,
        // Add connection timeout options
        connectTimeout: 60000,
        acquireTimeout: 60000,                  
        timeout: 60000,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Recording]),
  ],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class AppModule {}