import * as fs from 'fs';
// @ts-ignore
import pdf = require('pdf-parse');

/**
 * Extracts text content from a PDF file.
 */
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await (pdf as any)(dataBuffer);
  return data.text;
};

/**
 * Simple chunking utility for PDF text.
 */
export const getChunks = (text: string, chunkSize: number = 1000): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
};
