import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateRecordingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}
