import { tool } from '@openai/agents';
import { z } from 'zod';
const { PDFParse: pdfParser } = require('pdf-parse');
import * as fs from 'fs';

// Tool 1: PDF Text Extraction
export const pdfExtractionTool = tool({
  name: 'pdfExtraction',
  description: 'Extract the full raw text content from the PDF file.',
  parameters: z.object({
    filePath: z.string().describe('The absolute path to the PDF file.'),
  }),
  execute: async ({ filePath }: { filePath: string }) => {
    console.log(`[Tool: pdfExtraction] Extracting from: ${filePath}`);
    try {
      if (!fs.existsSync(filePath)) throw new Error(`File not found at ${filePath}`);
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new pdfParser({ data: dataBuffer });
      const result = await parser.getText();
      const text = result.text.trim();
      if (!text) return 'The PDF appears to be empty or contains only images.';
      console.log(`[Tool: pdfExtraction] Extracted ${text.length} characters.`);
      return text;
    } catch (e) {
      return `Error extracting PDF: ${e.message}`;
    }
  },
});

// Tool 2: Chunk Retriever - keyword-based semantic search
export const chunkRetrieverTool = tool({
  name: 'chunkRetriever',
  description: 'Search the document for chunks of text relevant to a keyword or phrase. Use this to find specific information.',
  parameters: z.object({
    documentText: z.string().describe('The full document text to search in.'),
    query: z.string().describe('The keyword or phrase to search for.'),
  }),
  execute: async ({ documentText, query }: { documentText: string; query: string }) => {
    console.log(`[Tool: chunkRetriever] Searching for: "${query}"`);
    const chunkSize = 500;
    const chunks: string[] = [];
    for (let i = 0; i < documentText.length; i += chunkSize) {
      chunks.push(documentText.slice(i, i + chunkSize));
    }
    const queryLower = query.toLowerCase();
    const relevant = chunks.filter((chunk) =>
      queryLower.split(' ').some((word) => chunk.toLowerCase().includes(word)),
    );
    if (relevant.length === 0) return 'No relevant chunks found for the given query.';
    console.log(`[Tool: chunkRetriever] Found ${relevant.length} relevant chunks.`);
    return relevant.slice(0, 5).join('\n---\n');
  },
});

// Tool 3: Section Locator - finds specific sections by heading
export const sectionLocatorTool = tool({
  name: 'sectionLocator',
  description: 'Locate and extract a specific section from the document by its heading name (e.g., "Introduction", "Conclusion").',
  parameters: z.object({
    documentText: z.string().describe('The full document text.'),
    sectionName: z.string().describe('The section heading to locate (e.g., "Introduction").'),
  }),
  execute: async ({ documentText, sectionName }: { documentText: string; sectionName: string }) => {
    console.log(`[Tool: sectionLocator] Looking for section: "${sectionName}"`);
    const lines = documentText.split('\n');
    const sectionLower = sectionName.toLowerCase();
    const startIdx = lines.findIndex((line) => line.toLowerCase().includes(sectionLower));
    if (startIdx === -1) return `Section "${sectionName}" not found in the document.`;
    const sectionLines = lines.slice(startIdx, startIdx + 40);
    console.log(`[Tool: sectionLocator] Section found at line ${startIdx}.`);
    return sectionLines.join('\n');
  },
});
