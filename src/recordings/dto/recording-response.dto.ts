export class RecordingResponseDto {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  courseId?: number;
  uploaded_by: number;
  created_at: Date;
}
