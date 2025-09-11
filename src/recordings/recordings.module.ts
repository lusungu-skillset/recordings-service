import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { RecordingsMessageController } from './recordings.message.controller';
import { Recording } from './recordings.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Recording])],
  controllers: [RecordingsController, RecordingsMessageController],
  providers: [RecordingsService],
})
export class RecordingsModule {}
