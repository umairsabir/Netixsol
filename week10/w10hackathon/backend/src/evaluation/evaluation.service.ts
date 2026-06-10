// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Evaluation } from './evaluation.schema';
// import Groq from 'groq-sdk';
// import { ConfigService } from '@nestjs/config';
// const pdfParse = require('pdf-parse');
// import { createObjectCsvStringifier } from 'csv-writer';

// @Injectable()
// export class EvaluationService {
//   private readonly groq: Groq;
//   private readonly logger = new Logger(EvaluationService.name);

//   constructor(
//     @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,
//     private configService: ConfigService,
//   ) {
//     this.groq = new Groq({ apiKey: this.configService.get<string>('GROQ_API_KEY') });
//   }

//   async evaluateAssignments(files: Express.Multer.File[], prompt: string, mode: string) {
//     const results: any[] = [];

//     for (const file of files) {
//       try {
//         const text = await this.extractTextFromPdf(file.buffer);
//         const evaluationResult = await this.evaluateWithGroq(text, prompt, mode);
        
//         // Save to database
//         const evaluation = new this.evaluationModel({
//           studentName: evaluationResult.studentName || 'Unknown',
//           rollNumber: evaluationResult.rollNumber || 'Unknown',
//           score: evaluationResult.score,
//           remarks: evaluationResult.remarks,
//           assignmentPrompt: prompt,
//           mode: mode,
//         });
//         await evaluation.save();

//         results.push(evaluationResult);
//       } catch (error) {
//         this.logger.error(`Failed to process a file: ${error.message}`);
//         results.push({
//           studentName: 'Error',
//           rollNumber: 'Error',
//           score: 0,
//           remarks: `Failed to evaluate: ${error.message}`,
//         });
//       }
//     }

//     return this.generateCsv(results);
//   }

//   private async extractTextFromPdf(buffer: Buffer): Promise<string> {
//     const data = await pdfParse(buffer);
//     return data.text;
//   }

//   private async evaluateWithGroq(text: string, prompt: string, mode: string) {
//     const systemPrompt = `You are an expert AI teacher assistant evaluating student assignments.
// You are given the text of a student's PDF submission. 
// Your job is to extract their name and roll number from the text, and evaluate the assignment based on the provided instructions.
// The evaluation mode is: ${mode.toUpperCase()}
// - If STRICT mode: Be very strict. Penalize heavily for off-topic, too short, irrelevant answers, bad grammar, and poor structure.
// - If LOOSE mode: Be flexible. Reward effort, give partial credit, and don't be too harsh on minor grammar/structure mistakes.

// ALWAYS evaluate for grammar, structure, and clarity, along with the specific assignment instructions provided by the teacher.

// TEACHER INSTRUCTIONS:
// "${prompt}"

// Output MUST be purely a JSON object in this exact format (no markdown, no other text):
// {
//   "studentName": "Extracted Name",
//   "rollNumber": "Extracted Roll Number",
//   "score": number (0-100),
//   "remarks": "Detailed remarks on what was good and what went wrong based on the mode and instructions"
// }`;

//     const response = await this.groq.chat.completions.create({
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: `Student Submission:\n\n${text}` }
//       ],
//       model: 'llama-3.3-70b-versatile',
//       temperature: 0.1,
//       response_format: { type: 'json_object' }
//     });

//     try {
//       const content = response.choices[0]?.message?.content;
//       return JSON.parse(content || '{}');
//     } catch (e) {
//       throw new Error('Failed to parse Groq response');
//     }
//   }

//   private generateCsv(results: any[]): string {
//     const csvStringifier = createObjectCsvStringifier({
//       header: [
//         { id: 'studentName', title: 'Student Name' },
//         { id: 'rollNumber', title: 'Roll Number' },
//         { id: 'score', title: 'Score' },
//         { id: 'remarks', title: 'Remarks' },
//       ]
//     });

//     return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(results);
//   }
// }


import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from './evaluation.schema';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
const pdfParse = require('pdf-parse');
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class EvaluationService {
  private readonly groq: Groq;
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,
    private configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async evaluateAssignments(files: Express.Multer.File[], prompt: string, mode: string) {
    const results: any[] = [];

    for (const file of files) {
      try {
        const text = await this.extractTextFromPdf(file.buffer);
        const evaluationResult = await this.evaluateWithGroq(text, prompt, mode);

        const evaluation = new this.evaluationModel({
          studentName: evaluationResult.studentName || 'Unknown',
          rollNumber: evaluationResult.rollNumber || 'Unknown',
          score: evaluationResult.score,
          remarks: evaluationResult.remarks,
          assignmentPrompt: prompt,
          mode: mode,
        });

        await evaluation.save();
        results.push(evaluationResult);
      } catch (error: any) {
        this.logger.error(`Failed to process a file: ${error.message}`);
        results.push({
          studentName: 'Error',
          rollNumber: 'Error',
          score: 0,
          remarks: `Failed to evaluate: ${error.message}`,
        });
      }
    }

    return this.generateCsv(results);
  }

  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();

    if (!text) {
      throw new Error('No text could be extracted from the PDF');
    }

    return text;
  }

  private async evaluateWithGroq(text: string, prompt: string, mode: string) {
    const normalizedMode = mode?.toLowerCase() === 'strict' ? 'STRICT' : 'LOOSE';

    // Light truncation to reduce context blowups without changing behavior too much
    const safeText = text.length > 20000 ? text.slice(0, 20000) : text;

    const systemPrompt = `You are an expert AI teacher assistant evaluating student assignments.

You are given the text of a student's PDF submission.
Your job is to extract the student's name and roll number only if they are clearly present in the submission.
Do not invent a roll number or name. If not clearly present, use "Unknown".

The evaluation mode is: ${normalizedMode}
- If STRICT mode: Be strict. Penalize off-topic, too short, irrelevant answers, bad grammar, weak structure, and missing required points.
- If LOOSE mode: Be flexible. Reward effort, give partial credit, and do not be overly harsh on minor grammar/structure mistakes.

Only evaluate based on the teacher instructions below.
Do not invent extra requirements such as roll number unless the teacher instructions explicitly ask for them.

TEACHER INSTRUCTIONS:
"${prompt}"

Output MUST be purely a JSON object in this exact format (no markdown, no other text):
{
  "studentName": "Extracted Name or Unknown",
  "rollNumber": "Extracted Roll Number or Unknown",
  "score": number,
  "remarks": "Detailed remarks on what was good and what went wrong based on the mode and instructions"
}`;

    const response = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Student Submission:\n\n${safeText}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    try {
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from Groq');
      }

      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleanedContent);

      return {
        studentName: parsed.studentName || 'Unknown',
        rollNumber: parsed.rollNumber || 'Unknown',
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        remarks: parsed.remarks || 'No remarks provided',
      };
    } catch (e) {
      throw new Error('Failed to parse Groq response');
    }
  }

  private generateCsv(results: any[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'studentName', title: 'Student Name' },
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'score', title: 'Score' },
        { id: 'remarks', title: 'Remarks' },
      ],
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(results);
  }
}