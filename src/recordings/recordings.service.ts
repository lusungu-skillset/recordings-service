import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRecordingDto } from './dto/create-recording.dto';
import { Recording } from './recordings.entity';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private readonly repo: Repository<Recording>,
  ) {}

  async create(file: Express.Multer.File, dto: CreateRecordingDto, uploaderId: number) {
    const rec = this.repo.create({
      title: dto.title,
      description: dto.description,
      courseId: dto.courseId,
      uploaderId,
      filename: file.originalname,
      filepath: file.path,     // Multer provides this
      mimetype: file.mimetype, // Multer provides this
      size: file.size,         // Multer provides this
    });
    return this.repo.save(rec);
  }

  async findById(id: string): Promise<Recording> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`Recording ${id} not found`);
    return rec;
  }

  async findAll(): Promise<Recording[]> {
    return this.repo.find();
  }

  async findByCourse(courseId: number): Promise<Recording[]> {
    return this.repo.find({ where: { courseId } });
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recording ${id} not found`);
    }
  }
}
