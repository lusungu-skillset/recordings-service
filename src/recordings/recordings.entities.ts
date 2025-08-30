import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Recording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() title: string;
  @Column({ type: 'text' }) description: string;
  @Column({ default: '' }) duration: string;   // e.g. "130 mins"
  @Column({ type: 'int', default: 1 }) lessons: number;

  @Column() fileName: string;         // stored file name on disk
  @Column() filePath: string;         // absolute or relative path
  @Column() mimeType: string;
  @Column({ type: 'bigint' }) size: number;

  @Column({ default: '' }) uploadedBy: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
