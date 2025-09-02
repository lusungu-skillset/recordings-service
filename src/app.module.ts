import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Recording } from './recordings/recordings.entities';
import { RecordingsController } from './app.controller';
import { RecordingsService } from './app.service';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT || 3306),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        entities: [Recording],
        synchronize: true, // ❗ set false in production + use migrations
      }),
    }),
    TypeOrmModule.forFeature([Recording]), // ✅ so service can inject repo
  ],
  controllers: [RecordingsController], // ✅ controller wired here
  providers: [RecordingsService], // ✅ service wired here
})
export class AppModule {}
