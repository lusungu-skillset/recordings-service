import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import type { Response, Request } from 'express'; // ✅ use `type` import so TS doesn’t complain
import { CreateRecordingDto } from './recordings/dto/create-recordings.dto';
import { RecordingsService } from './app.service';

const STORAGE_DIR =
  process.env.STORAGE_DIR || path.resolve(process.cwd(), 'storage/recordings');

function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}
ensureDir();

function safeFilename(original: string) {
  const ext = path.extname(original);
  const base = path.basename(original, ext).replace(/[^a-z0-9_\-]/gi, '_');
  const stamp = Date.now();
  return `${base}_${stamp}${ext}`;
}

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly service: RecordingsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, STORAGE_DIR),
        filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
      }),
      limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateRecordingDto,
  ) {
    if (!file) {
      throw new HttpException('Video file is required', HttpStatus.BAD_REQUEST);
    }

    const filePath = path.join(STORAGE_DIR, file.filename);
    const created = await this.service.create(dto, {
      fileName: file.filename,
      filePath,
      mimeType: file.mimetype || 'video/mp4',
      size: file.size,
    });

    return { message: 'Uploaded', recording: created };
  }

  @Get()
  async list() {
    const items = await this.service.findAll();
    return items.map((r) => ({
      ...r,
      watchUrl: `/recordings/${r.id}/stream`,
      downloadUrl: `/recordings/${r.id}/download`,
    }));
  }

  @Get(':id/stream')
  async stream(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const rec = await this.service.findOne(id);
    const stat = fs.statSync(rec.filePath);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': rec.mimeType || 'video/mp4',
      });
      fs.createReadStream(rec.filePath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(rec.filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': rec.mimeType || 'video/mp4',
    });

    stream.pipe(res);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const rec = await this.service.findOne(id);

    res.setHeader('Content-Type', rec.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', rec.size.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${rec.fileName}"`,
    );

    fs.createReadStream(rec.filePath).pipe(res);
  }
}
