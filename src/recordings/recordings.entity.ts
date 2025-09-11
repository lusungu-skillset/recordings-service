import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  filename: string; 

  @Column()
  filepath: string; 

  @Column()
  mimetype: string; 

  @Column()
  size: number; 

  @Column()
  uploaderId: number;

  @Column()
  courseId: number;

  @CreateDateColumn()
  createdAt: Date;
}
