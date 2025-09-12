import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Req,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
  HttpException,
  HttpStatus,
  NotFoundException,
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
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Ensure directory exists
          if (!fs.existsSync(VIDEO_PATH)) {
            fs.mkdirSync(VIDEO_PATH, { recursive: true });
          }
          cb(null, VIDEO_PATH);
        },
        filename: (req, file, cb) => {
          // Generate unique filename with timestamp and original extension
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          cb(null, `${uniqueSuffix}${extension}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 500, // 500MB limit
      },
      fileFilter: (req, file, cb) => {
        // Accept video files only
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed!'), false);
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createRecordingDto: CreateRecordingDto,
    @Req() req: Request,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const userId = (req as any).user?.id ?? 1; // Fallback for development
      const recording = await this.recordingsService.create(
        file,
        createRecordingDto,
        userId,
      );

      return {
        status: 'success',
        message: 'File uploaded successfully',
        data: recording,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const recordings = await this.recordingsService.findAll();
      return {
        status: 'success',
        data: recordings,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch recordings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    try {
      const numericCourseId = parseInt(courseId, 10);
      if (isNaN(numericCourseId)) {
        throw new HttpException('Invalid course ID', HttpStatus.BAD_REQUEST);
      }

      const recordings = await this.recordingsService.findByCourse(numericCourseId);
      return {
        status: 'success',
        data: recordings,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch course recordings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const recording = await this.recordingsService.findById(id);
      return {
        status: 'success',
        data: recording,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Failed to fetch recording',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stream/:id')
  async stream(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
    try {
      const recording = await this.recordingsService.findById(id);
      
      if (!fs.existsSync(recording.filepath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const stat = fs.statSync(recording.filepath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (!range) {
        // Send entire file if no range header
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Content-Type', recording.mimetype);
        res.setHeader('Content-Disposition', `inline; filename="${recording.filename}"`);
        
        const readStream = fs.createReadStream(recording.filepath);
        readStream.pipe(res);
        return;
      }

      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': recording.mimetype,
      });

      // Stream the specific chunk
      const readStream = fs.createReadStream(recording.filepath, { start, end });
      readStream.pipe(res);

    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: error.message || 'Failed to stream recording',
        });
      }
    }
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    try {
      const recording = await this.recordingsService.findById(id);
      
      if (!fs.existsSync(recording.filepath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      res.setHeader('Content-Type', recording.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${recording.filename}"`);
      res.setHeader('Content-Length', recording.size);

      const readStream = fs.createReadStream(recording.filepath);
      readStream.pipe(res);

    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: error.message || 'Failed to download recording',
        });
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const recording = await this.recordingsService.findById(id);
      
      // Delete physical file
      if (fs.existsSync(recording.filepath)) {
        fs.unlinkSync(recording.filepath);
      }

      // Delete database record
      await this.recordingsService.delete(id);

      return {
        status: 'success',
        message: 'Recording deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Failed to delete recording',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}