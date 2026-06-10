import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.productsService.searchByTitle(q);
  }

  @Get('ai-search')
  aiSearch(@Query('q') q: string) {
    return this.productsService.aiSearch(q);
  }

  @Post('chat')
  chat(@Body('message') message: string) {
    return this.productsService.chat(message);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Post('speech-to-text')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max (Whisper limit)
    }),
  )
  transcribeAudio(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.transcribeAudio(file);
  }

  @Post('text-to-speech')
  async textToSpeech(@Body('text') text: string, @Res() res: any) {
    const audioBuffer = await this.productsService.textToSpeech(text);
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  }
}

