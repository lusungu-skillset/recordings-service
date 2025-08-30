import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateRecordingDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() duration: string;
  @IsInt() @Min(1) lessons: number;
  @IsString() uploadedBy: string; // from auth (admin); temporary field
}
