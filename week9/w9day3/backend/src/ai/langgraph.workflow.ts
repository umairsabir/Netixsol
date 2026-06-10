import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ResearchDocument,
  ResearchDocumentDocument,
} from '../documents/schemas/research-document.schema';
import {
  QueryTrace,
  QueryTraceDocument,
  TraceStep,
  SubQuestion,
  RankedDocument,
  Summary,
  Contradiction,
} from '../documents/schemas/query-trace.schema';
import { removeStopwords } from 'stopword';
import compromise from 'compromise';

// Define the state annotation using LangGraph's modern API
const ResearchStateAnnotation = Annotation.Root({
  queryId: Annotation<string>(),
  originalQuestion: Annotation<string>(),
  subQuestions: Annotation<SubQuestion[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  documents: Annotation<ResearchDocument[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  rankedDocuments: Annotation<RankedDocument[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  summaries: Annotation<Summary[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  contradictions: Annotation<Contradiction[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  finalAnswer: Annotation<string>({
    default: () => '',
    reducer: (curr, update) => update ?? curr,
  }),
  steps: Annotation<TraceStep[]>({
    default: () => [],
    reducer: (curr, update) => [...curr, ...(update || [])],
  }),
  error: Annotation<string | undefined>(),
});

type ResearchState = typeof ResearchStateAnnotation.State;

@Injectable()
export class LangGraphWorkflow {
  private readonly logger = new Logger(LangGraphWorkflow.name);
  private llm: ChatGroq;
  private workflow: any;

  constructor(
    @InjectModel(ResearchDocument.name)
    private researchDocumentModel: Model<ResearchDocumentDocument>,
    @InjectModel(QueryTrace.name)
    private queryTraceModel: Model<QueryTraceDocument>,
  ) {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    this.workflow = this.buildWorkflow();
  }

  private addStep(
    state: ResearchState,
    stepName: string,
    input: any,
    output: any,
    startTime: number,
  ): void {
    state.steps.push({
      step: stepName,
      timestamp: new Date(),
      input,
      output,
      duration: Date.now() - startTime,
    });
  }

  // Node 1: Question Splitter
  private async questionSplitter(
    state: ResearchState,
  ): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(
      `[QuestionSplitter] Breaking down: ${state.originalQuestion}`,
    );

    try {
      const prompt = `Break the following question into 2-4 smaller, specific sub-questions that would help answer the main question.

Main Question: "${state.originalQuestion}"

Return ONLY a JSON array of objects with "id" and "text" properties. Example:
[
  {"id": "1", "text": "What is SQL?"},
  {"id": "2", "text": "What is NoSQL?"},
  {"id": "3", "text": "What are the pros and cons of each?"}
]`;

      const response = await this.llm.invoke(prompt);
      const content = response.content as string;

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let subQuestions: SubQuestion[] = [];

      if (jsonMatch) {
        try {
          subQuestions = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Fallback: parse manually
          const lines = content
            .split('\n')
            .filter(
              (l) => l.trim().startsWith('-') || l.trim().match(/^\d+\./),
            );
          subQuestions = lines
            .map((line, idx) => ({
              id: (idx + 1).toString(),
              text: line.replace(/^[-\d.\s]*/, '').trim(),
            }))
            .filter((q) => q.text.length > 0)
            .slice(0, 4);
        }
      }

      if (subQuestions.length === 0) {
        // Ultimate fallback
        subQuestions = [{ id: '1', text: state.originalQuestion }];
      }

      this.addStep(
        state,
        'QuestionSplitter',
        state.originalQuestion,
        subQuestions,
        startTime,
      );

      return { subQuestions };
    } catch (error) {
      this.logger.error(`[QuestionSplitter] Error: ${error.message}`);
      return {
        subQuestions: [{ id: '1', text: state.originalQuestion }],
        error: error.message,
      };
    }
  }

  // Node 2: Document Finder
  private async documentFinder(
    state: ResearchState,
  ): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(
      `[DocumentFinder] Finding documents for ${state.subQuestions.length} sub-questions`,
    );

    try {
      // Collect keywords from all sub-questions
      const allKeywords = new Set<string>();
      state.subQuestions.forEach((sq) => {
        const words = this.extractKeywords(sq.text);
        words.forEach((w) => allKeywords.add(w.toLowerCase()));
      });

      // Find all documents that match any keyword
      const keywordArray = Array.from(allKeywords);
      this.logger.log(
        `[DocumentFinder] Searching with keywords: ${keywordArray.join(', ')}`,
      );

      const documents = await this.researchDocumentModel
        .find({
          $or: [
            { keywords: { $in: keywordArray } },
            { content: { $regex: keywordArray.join('|'), $options: 'i' } },
            { title: { $regex: keywordArray.join('|'), $options: 'i' } },
          ],
        })
        .limit(20)
        .exec();

      this.logger.log(`[DocumentFinder] Found ${documents.length} documents`);

      this.addStep(
        state,
        'DocumentFinder',
        { keywords: keywordArray },
        { count: documents.length },
        startTime,
      );

      return { documents };
    } catch (error) {
      this.logger.error(`[DocumentFinder] Error: ${error.message}`);
      return { documents: [], error: error.message };
    }
  }

  // Node 3: Ranker (TF-IDF based)
  private async ranker(state: ResearchState): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(`[Ranker] Ranking ${state.documents.length} documents`);

    try {
      if (state.documents.length === 0) {
        return { rankedDocuments: [] };
      }

      // Combine sub-questions into query text
      const queryText = state.subQuestions.map((sq) => sq.text).join(' ');
      const queryKeywords = this.extractKeywords(queryText);

      // Calculate TF-IDF scores
      const ranked = state.documents.map((doc) => {
        const docText = `${doc.title} ${doc.content}`;
        const docKeywords = this.extractKeywords(docText);

        const score = this.calculateTfIdfScore(
          queryKeywords,
          docKeywords,
          state.documents,
        );

        return {
          id: (doc as any)._id.toString(),
          title: doc.title,
          topic: doc.topic,
          content: doc.content.substring(0, 1000), // Truncated for state
          score,
        };
      });

      // Sort by score descending and take top 5
      ranked.sort((a, b) => b.score - a.score);
      const topDocuments = ranked.slice(0, 5);

      this.logger.log(`[Ranker] Top 5 documents selected`);
      this.addStep(
        state,
        'Ranker',
        { totalDocuments: state.documents.length },
        { topDocuments },
        startTime,
      );

      return { rankedDocuments: topDocuments };
    } catch (error) {
      this.logger.error(`[Ranker] Error: ${error.message}`);
      return { rankedDocuments: [], error: error.message };
    }
  }

  // Node 4: Summarizer (TextRank-based)
  private async summarizer(
    state: ResearchState,
  ): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(
      `[Summarizer] Summarizing ${state.rankedDocuments.length} documents`,
    );

    try {
      const summaries: Summary[] = state.rankedDocuments
        .map((doc) => {
          const fullDoc = state.documents.find(
            (d) => (d as any)._id.toString() === doc.id,
          );
          if (!fullDoc) return null;

          const content = fullDoc.content;
          const sentences = this.splitIntoSentences(content);

          // Use simple extractive summarization
          const keySentences = this.extractKeySentences(sentences, 3);
          const summary = keySentences.join(' ');

          return {
            documentId: doc.id,
            title: doc.title,
            summary,
            keySentences,
          };
        })
        .filter((s) => s !== null) as Summary[];

      this.logger.log(`[Summarizer] Created ${summaries.length} summaries`);
      this.addStep(
        state,
        'Summarizer',
        { documents: state.rankedDocuments.map((d) => d.id) },
        { summaries },
        startTime,
      );

      return { summaries };
    } catch (error) {
      this.logger.error(`[Summarizer] Error: ${error.message}`);
      return { summaries: [], error: error.message };
    }
  }

  // Node 5: Cross-Checker
  private async crossChecker(
    state: ResearchState,
  ): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(`[CrossChecker] Checking for contradictions`);

    try {
      const contradictions: Contradiction[] = [];

      // Simple contradiction detection using keyword overlap and sentiment
      for (let i = 0; i < state.summaries.length; i++) {
        for (let j = i + 1; j < state.summaries.length; j++) {
          const doc1 = state.summaries[i];
          const doc2 = state.summaries[j];

          // Check for opposing keywords (e.g., "better" vs "worse")
          const oppKeywords = this.findOpposingKeywords(
            doc1.summary,
            doc2.summary,
          );

          if (oppKeywords.length > 0) {
            contradictions.push({
              between: [doc1.title, doc2.title],
              description: `Contradiction detected: "${oppKeywords.join(', ')}"`,
            });
          }
        }
      }

      this.logger.log(
        `[CrossChecker] Found ${contradictions.length} contradictions`,
      );
      this.addStep(
        state,
        'CrossChecker',
        { summaries: state.summaries.length },
        { contradictions },
        startTime,
      );

      return { contradictions };
    } catch (error) {
      this.logger.error(`[CrossChecker] Error: ${error.message}`);
      return { contradictions: [], error: error.message };
    }
  }

  // Node 6: Final Answer Maker
  private async finalAnswerMaker(
    state: ResearchState,
  ): Promise<Partial<ResearchState>> {
    const startTime = Date.now();
    this.logger.log(`[FinalAnswerMaker] Generating final answer`);

    try {
      const summariesText = state.summaries
        .map(
          (s) =>
            `Document: ${s.title}\nSummary: ${s.summary}\nKey Points: ${s.keySentences.join(' ')}`,
        )
        .join('\n\n');

      const contradictionsText =
        state.contradictions.length > 0
          ? `\n\nNote: The following contradictions were found between sources:\n${state.contradictions.map((c) => `- Between "${c.between.join('" and "')}": ${c.description}`).join('\n')}`
          : '';

      const prompt = `Based on the following document summaries, provide a comprehensive answer to the question: "${state.originalQuestion}"

DOCUMENT SUMMARIES:
${summariesText}
${contradictionsText}

Please provide:
1. A clear, direct answer to the question
2. Supporting evidence from the documents
3. Any important caveats or limitations

Answer:`;

      const response = await this.llm.invoke(prompt);
      const finalAnswer = response.content as string;

      this.addStep(
        state,
        'FinalAnswerMaker',
        { summaries: state.summaries.length },
        { finalAnswer: finalAnswer.substring(0, 200) + '...' },
        startTime,
      );

      return { finalAnswer };
    } catch (error) {
      this.logger.error(`[FinalAnswerMaker] Error: ${error.message}`);
      return {
        finalAnswer: 'Unable to generate final answer due to an error.',
        error: error.message,
      };
    }
  }

  // Build the workflow graph using modern Annotation API
  private buildWorkflow(): any {
    const workflow = new StateGraph(ResearchStateAnnotation)
      .addNode(
        'questionSplitter',
        async (state) => await this.questionSplitter(state),
      )
      .addNode(
        'documentFinder',
        async (state) => await this.documentFinder(state),
      )
      .addNode('ranker', async (state) => await this.ranker(state))
      .addNode('summarizer', async (state) => await this.summarizer(state))
      .addNode('crossChecker', async (state) => await this.crossChecker(state))
      .addNode(
        'finalAnswerMaker',
        async (state) => await this.finalAnswerMaker(state),
      )
      .addEdge(START, 'questionSplitter')
      .addEdge('questionSplitter', 'documentFinder')
      .addEdge('documentFinder', 'ranker')
      .addEdge('ranker', 'summarizer')
      .addEdge('summarizer', 'crossChecker')
      .addEdge('crossChecker', 'finalAnswerMaker')
      .addEdge('finalAnswerMaker', END);

    return workflow.compile();
  }

  // Main execution method
  async runResearch(
    query: string,
  ): Promise<{ trace: QueryTrace; answer: string }> {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const initialState: ResearchState = {
      queryId,
      originalQuestion: query,
      subQuestions: [],
      documents: [],
      rankedDocuments: [],
      summaries: [],
      contradictions: [],
      finalAnswer: '',
      steps: [],
      error: undefined,
    };

    this.logger.log(`[Workflow] Starting research for: ${query}`);

    try {
      const result = await this.workflow.invoke(initialState);

      // Save trace to database
      const trace = new this.queryTraceModel({
        queryId,
        originalQuestion: query,
        steps: result.steps,
        subQuestions: result.subQuestions,
        rankedDocuments: result.rankedDocuments,
        summaries: result.summaries,
        contradictions: result.contradictions,
        finalAnswer: result.finalAnswer,
        status: 'completed',
      });

      await trace.save();

      this.logger.log(`[Workflow] Completed. Trace saved: ${queryId}`);

      return {
        trace: trace.toObject(),
        answer: result.finalAnswer,
      };
    } catch (error) {
      this.logger.error(`[Workflow] Error: ${error.message}`);

      const errorTrace = new this.queryTraceModel({
        queryId,
        originalQuestion: query,
        steps: initialState.steps,
        status: 'error',
        error: error.message,
      });

      await errorTrace.save();

      throw error;
    }
  }

  // Helper methods
  private extractKeywords(text: string): string[] {
    const doc = compromise(text);
    const nouns = doc.nouns().out('array') as string[];
    const verbs = doc.verbs().out('array') as string[];
    const words = [...nouns, ...verbs];

    return removeStopwords(
      words
        .map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
        .filter((w) => w.length > 2),
    );
  }

  private calculateTfIdfScore(
    queryKeywords: string[],
    docKeywords: string[],
    allDocs: ResearchDocument[],
  ): number {
    const tf = new Map<string, number>();
    const df = new Map<string, number>();
    const N = allDocs.length;

    // Calculate term frequency in document
    docKeywords.forEach((word) => {
      tf.set(word, (tf.get(word) || 0) + 1);
    });

    // Calculate document frequency
    queryKeywords.forEach((word) => {
      const count = allDocs.filter((d) => {
        const docText = `${d.title} ${d.content}`.toLowerCase();
        return docText.includes(word.toLowerCase());
      }).length;
      df.set(word, count);
    });

    // Calculate TF-IDF score
    let score = 0;
    queryKeywords.forEach((word) => {
      const termFreq = tf.get(word.toLowerCase()) || 0;
      const docFreq = df.get(word) || 1;
      const idf = Math.log(N / docFreq);
      score += termFreq * idf;
    });

    return score;
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .replace(/([.?!])\s+(?=[A-Z])/g, '$1|')
      .split('|')
      .filter((s) => s.trim().length > 0);
  }

  private extractKeySentences(sentences: string[], count: number): string[] {
    // Simple scoring: longer sentences with more content words
    const scored = sentences.map((s) => {
      const words = s.split(/\s+/).length;
      const contentWords = s.split(/\s+/).filter((w) => w.length > 4).length;
      return { sentence: s, score: contentWords * Math.log(words + 1) };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((s) => s.sentence);
  }

  private findOpposingKeywords(text1: string, text2: string): string[] {
    const opposites = [
      ['better', 'worse'],
      ['superior', 'inferior'],
      ['faster', 'slower'],
      ['more', 'less'],
      ['easier', 'harder'],
      ['scalable', 'limited'],
      ['secure', 'vulnerable'],
    ];

    const found: string[] = [];
    const t1 = text1.toLowerCase();
    const t2 = text2.toLowerCase();

    opposites.forEach(([word1, word2]) => {
      if (
        (t1.includes(word1) && t2.includes(word2)) ||
        (t1.includes(word2) && t2.includes(word1))
      ) {
        found.push(`${word1}/${word2}`);
      }
    });

    return found;
  }
}
