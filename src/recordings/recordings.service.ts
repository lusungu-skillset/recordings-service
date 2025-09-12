import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRecordingDto } from './dto/create-recording.dto';
import { Recording } from './recordings.entity';


@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
  ) {}

  async create(
    file: Express.Multer.File,
    createRecordingDto: CreateRecordingDto,
    uploaderId: number,
  ): Promise<Recording> {
    const recording = this.recordingRepository.create({
      title: createRecordingDto.title,
      description: createRecordingDto.description,
      courseId: createRecordingDto.courseId,
      uploaderId,
      filename: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
    });

    return await this.recordingRepository.save(recording);
  }

  async findById(id: string): Promise<Recording> {
    const recording = await this.recordingRepository.findOne({ where: { id } });
    
    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
    
    return recording;
  }

  async findAll(): Promise<Recording[]> {
    return await this.recordingRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCourse(courseId: number): Promise<Recording[]> {
    return await this.recordingRepository.find({
      where: { courseId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    const result = await this.recordingRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
  }
}