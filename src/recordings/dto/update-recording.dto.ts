import { IsOptional, IsString } from 'class-validator';

export class UpdateRecordingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
