import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ResearchDocument,
  ResearchDocumentDocument,
} from './schemas/research-document.schema';
import { QueryTrace, QueryTraceDocument } from './schemas/query-trace.schema';
import compromise from 'compromise';
import { removeStopwords } from 'stopword';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ResearchDocument.name)
    private researchDocumentModel: Model<ResearchDocumentDocument>,
    @InjectModel(QueryTrace.name)
    private queryTraceModel: Model<QueryTraceDocument>,
  ) {}

  async createResearchDocument(data: {
    title: string;
    topic: string;
    content: string;
    keywords?: string[];
  }): Promise<ResearchDocumentDocument> {
    // Extract keywords if not provided
    let keywords = data.keywords;
    if (!keywords || keywords.length === 0) {
      keywords = this.extractKeywords(data.content);
    }

    const wordCount = data.content.split(/\s+/).length;

    const newDocument = new this.researchDocumentModel({
      title: data.title,
      topic: data.topic,
      content: data.content,
      keywords,
      wordCount,
    });

    return newDocument.save();
  }

  async findAllResearchDocuments(): Promise<ResearchDocumentDocument[]> {
    return this.researchDocumentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findResearchDocumentById(
    id: string,
  ): Promise<ResearchDocumentDocument | null> {
    return this.researchDocumentModel.findById(id).exec();
  }

  async findTraceByQueryId(
    queryId: string,
  ): Promise<QueryTraceDocument | null> {
    return this.queryTraceModel.findOne({ queryId }).exec();
  }

  async findAllTraces(): Promise<QueryTraceDocument[]> {
    return this.queryTraceModel.find().sort({ createdAt: -1 }).exec();
  }

  async getDocumentCount(): Promise<number> {
    return this.researchDocumentModel.countDocuments().exec();
  }

  private extractKeywords(text: string): string[] {
    const doc = compromise(text);
    const nouns = doc.nouns().out('array') as string[];
    const words = nouns
      .map((w: string) => w.toLowerCase().replace(/[^a-z]/g, ''))
      .filter((w: string) => w.length > 2);
    const filtered = removeStopwords(words) as string[];
    return [...new Set(filtered)].slice(0, 20);
  }
}
