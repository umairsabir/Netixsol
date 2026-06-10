import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { HealthcareWorkflow } from '../ai/healthcare.workflow';
import Groq from 'groq-sdk';
import { toFile } from 'openai';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private healthcareWorkflow: HealthcareWorkflow,
  ) {}

  async findAll(category?: string) {
    const filter: any = {};
    if (category) filter.category = category;
    return this.productModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async searchByTitle(query: string) {
    if (!query?.trim()) return this.findAll();
    return this.productModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean()
      .exec();
  }

  async aiSearch(query: string) {
    return this.healthcareWorkflow.aiSearch(query);
  }

  async chat(query: string) {
    return this.healthcareWorkflow.chat(query);
  }

  async getCategories() {
    return this.productModel.distinct('category').exec();
  }

  async getProductCount() {
    return this.productModel.countDocuments().exec();
  }

  async bulkCreate(products: any[]) {
    return this.productModel.insertMany(products);
  }

  async transcribeAudio(file: Express.Multer.File): Promise<{ text: string }> {
    if (!file) throw new BadRequestException('No audio file provided');

    this.logger.log(
      `Transcribing audio: ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
    );

    try {
      // Determine file extension from mimetype
      const mimeToExt: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/ogg': 'ogg',
        'audio/wav': 'wav',
        'audio/mpeg': 'mp3',
        'audio/mp4': 'mp4',
        'audio/x-m4a': 'm4a',
        'audio/mp3': 'mp3',
      };
      const ext = mimeToExt[file.mimetype] ?? 'webm';
      const filename = `voice.${ext}`;

      // Convert buffer to a File-like object for Groq SDK
      const audioFile = await toFile(file.buffer, filename, {
        type: file.mimetype,
      });

      const transcription = await this.groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        language: 'en',
        response_format: 'json',
      });

      this.logger.log(`Transcribed: "${transcription.text}"`);
      return { text: transcription.text };
    } catch (err: any) {
      this.logger.error('Transcription failed', err?.message);
      throw new BadRequestException(
        `Audio transcription failed: ${err?.message ?? 'Unknown error'}`,
      );
    }
  }

  async textToSpeech(_text: string): Promise<Buffer> {
    throw new BadRequestException({ code: 'TTS_UNAVAILABLE', message: 'TTS not available, using browser fallback' });
  }
}


