import {
  Controller, Post, Get, Param, Res, Req, Body, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import type { Response, Request } from 'express';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';

const VIDEO_PATH = process.env.VIDEO_UPLOAD_PATH || '/data/videos';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly svc: RecordingsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(VIDEO_PATH, { recursive: true });
        cb(null, VIDEO_PATH);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + extname(file.originalname));
      },
    }),
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateRecordingDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id ?? 1; 
    return this.svc.create(file, dto, userId);
  }

  @Get('stream/:id')
  async stream(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
    const rec = await this.svc.findById(id);
    const stat = fs.statSync(rec.filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', rec.mimetype);
      fs.createReadStream(rec.filepath).pipe(res);
      return;
    }

    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    // Handle invalid ranges
    if (start >= fileSize || end >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': rec.mimetype,
    });

    fs.createReadStream(rec.filepath, { start, end }).pipe(res);
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const rec = await this.svc.findById(id);
    res.download(rec.filepath, rec.filename);
  }
}
