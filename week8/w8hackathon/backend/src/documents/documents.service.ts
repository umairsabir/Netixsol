import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentDocument, DocumentItem } from './schemas/document.schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentItem.name)
    private documentModel: Model<DocumentDocument>,
  ) {}

  async create(file: any): Promise<DocumentDocument> {
    const newDocument = new this.documentModel({
      originalName: file.originalname || file.originalName,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      cloudinaryUrl: file.cloudinaryUrl,
      status: 'processing',
    });

    return newDocument.save();
  }

  async findAll(): Promise<DocumentDocument[]> {
    return this.documentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<DocumentDocument | null> {
    return this.documentModel.findById(id).exec() as any;
  }

  async updateAnalysis(
    id: string,
    analysis: any,
    fullText?: string,
  ): Promise<DocumentDocument | null> {
    const updateData: any = { analysis, status: 'ready' };
    if (fullText) {
      updateData.fullText = fullText;
    }
    return this.documentModel
      .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .exec() as any;
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<DocumentDocument | null> {
    return this.documentModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' },
    );
  }

  async delete(id: string): Promise<void> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // 1. Delete the record from DB
    await this.documentModel.findByIdAndDelete(id).exec();

    // 2. Clean up local file if exists
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
  }
}
