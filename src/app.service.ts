import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording } from './recordings/recordings.entities';
import { CreateRecordingDto } from './recordings/dto/create-recordings.dto';


@Injectable()
export class RecordingsService {
  constructor(@InjectRepository(Recording) private repo: Repository<Recording>) {}

  async create(meta: CreateRecordingDto, fileInfo: {fileName:string; filePath:string; mimeType:string; size:number}) {
    const rec = this.repo.create({ ...meta, ...fileInfo });
    return this.repo.save(rec);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException('Recording not found');
    return rec;
  }

  async remove(id: number) {
    const rec = await this.findOne(id);
    await this.repo.remove(rec);
    return { deleted: true };
  }
}
