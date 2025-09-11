import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RecordingsService } from './recordings.service';

@Controller()
export class RecordingsMessageController {
  constructor(private readonly svc: RecordingsService) {}

  @MessagePattern({ cmd: 'get_recording' })
  async getRecording(id: string) {
    return this.svc.findById(id);
  }

  @MessagePattern({ cmd: 'list_recordings' })
  async listAll() {
    return this.svc.findAll();
  }

  @MessagePattern({ cmd: 'list_recordings_by_course' })
  async listByCourse(courseId: number) {
    return this.svc.findByCourse(courseId);
  }

  @MessagePattern({ cmd: 'delete_recording' })
  async deleteRecording(id: string) {
    return this.svc.delete(id);
  }
}
