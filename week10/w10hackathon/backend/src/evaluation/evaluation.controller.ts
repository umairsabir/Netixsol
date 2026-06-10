import { Controller, Post, Body, UploadedFiles, UseInterceptors, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EvaluationService } from './evaluation.service';
import type { Response } from 'express';

@Controller('evaluate')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async evaluateAssignments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('prompt') prompt: string,
    @Body('mode') mode: string,
    @Res() res: Response
  ) {
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    if (!prompt) {
      return res.status(400).json({ message: 'Assignment instructions missing' });
    }

    const csvData = await this.evaluationService.evaluateAssignments(files, prompt, mode || 'loose');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="marks_sheet.csv"');
    return res.status(200).send(csvData);
  }
}
