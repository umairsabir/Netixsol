import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// ─── State ────────────────────────────────────────────────────────────────────

const CricketStateAnnotation = Annotation.Root({
  question: Annotation<string>(),
  isRelevant: Annotation<boolean>(),
  generatedQuery: Annotation<any>(),
  queryResults: Annotation<any[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  formattedAnswer: Annotation<string>(),
});

type CricketState = typeof CricketStateAnnotation.State;

// ─── Workflow ──────────────────────────────────────────────────────────────────

@Injectable()
export class CricketWorkflow {
  private readonly logger = new Logger(CricketWorkflow.name);
  private llm: ChatGroq;
  private workflow: any;

  constructor(
    @InjectModel('Test') private testModel: Model<any>,
    @InjectModel('ODI') private odiModel: Model<any>,
    @InjectModel('T20') private t20Model: Model<any>,
  ) {
    this.llm = new ChatGroq({
      model: 'llama-3.1-8b-instant',
      apiKey: process.env.GROQ_API_KEY,
    });
    this.workflow = this.buildWorkflow();
  }

  // ─── Node 1: Relevancy Checker ───────────────────────────────────────────────

  private async relevancyChecker(state: CricketState): Promise<Partial<CricketState>> {
    this.logger.log(`[RelevancyChecker] Checking: ${state.question}`);

    try {
      const prompt = `Is this question related to cricket statistics, players, or matches?
Question: "${state.question}"
Respond ONLY with JSON: {"isRelevant": true/false}`;

      const response = await this.llm.invoke(prompt);
      const jsonMatch = (response.content as string).match(/\{[\s\S]*\}/);
      let isRelevant = false;

      if (jsonMatch) {
        try { isRelevant = JSON.parse(jsonMatch[0]).isRelevant; } catch {}
      }

      const cricketKeywords = ['cricket', 'test', 'odi', 't20', 'runs', 'wickets',
        'batting', 'bowling', 'average', 'hundreds', 'fifties', 'matches', 'innings', 'player'];
      if (cricketKeywords.some((kw) => state.question.toLowerCase().includes(kw))) {
        isRelevant = true;
      }

      return { isRelevant };
    } catch (error) {
      this.logger.error(`[RelevancyChecker] Error: ${error.message}`);
      return { isRelevant: false };
    }
  }

  // ─── Node 2: Query Generator ─────────────────────────────────────────────────

  private async queryGenerator(state: CricketState): Promise<Partial<CricketState>> {
    this.logger.log(`[QueryGenerator] Generating query for: ${state.question}`);

    if (!state.isRelevant) return { generatedQuery: null };

    try {
      const prompt = `Convert this cricket question into a MongoDB query specification.

Available collections:
- "test"  → Test match player stats
- "odi"   → ODI match player stats  
- "t20"   → T20 match player stats

Fields in each collection: playerId, year, matches, runs, highScore, average, hundreds, fifties, wickets, bestBowling, catches, stumpings

Question: "${state.question}"

Respond ONLY with JSON:
{
  "collection": "test"/"odi"/"t20",
  "filter": {},
  "sort": { "field": -1 },
  "limit": number,
  "projection": ["field1", "field2"]
}`;

      const response = await this.llm.invoke(prompt);
      this.logger.log(`[QueryGenerator] LLM response: ${response.content}`);
      const jsonMatch = (response.content as string).match(/\{[\s\S]*\}/);
      let generatedQuery: any = null;

      if (jsonMatch) {
        try { generatedQuery = JSON.parse(jsonMatch[0]); } catch {}
      }

      return { generatedQuery };
    } catch (error) {
      this.logger.error(`[QueryGenerator] Error: ${error.message}`);
      return { generatedQuery: null };
    }
  }

  // ─── Node 3: Query Executor ───────────────────────────────────────────────────

  private async queryExecutor(state: CricketState): Promise<Partial<CricketState>> {
    this.logger.log(`[QueryExecutor] Executing query`);

    if (!state.generatedQuery) return { queryResults: [] };

    try {
      const { collection, filter, sort, limit, projection } = state.generatedQuery;

      // Select correct model based on collection
      let model: Model<any>;
      if (collection === 'odi') model = this.odiModel;
      else if (collection === 't20') model = this.t20Model;
      else model = this.testModel; // default to test

      this.logger.log(`[QueryExecutor] Collection: ${collection}, Filter: ${JSON.stringify(filter)}`);

      let query = model.find(filter || {});
      if (sort) query = query.sort(sort);
      if (limit) query = query.limit(limit);
      if (projection && Array.isArray(projection)) {
        const projObj = projection.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
        query = query.select(projObj);
      }

      const results = await query.lean().exec();

      for (const r of results as any[]) {
        delete r._id;
        delete r.__v;
      }

      this.logger.log(`[QueryExecutor] Found ${results.length} results`);
      return { queryResults: results };
    } catch (error) {
      this.logger.error(`[QueryExecutor] Error: ${error.message}`);
      return { queryResults: [] };
    }
  }

  // ─── Node 4: Answer Formatter ─────────────────────────────────────────────────

  private async answerFormatter(state: CricketState): Promise<Partial<CricketState>> {
    this.logger.log(`[AnswerFormatter] Formatting answer`);

    if (!state.isRelevant) {
      return { formattedAnswer: 'Sorry, I can only answer cricket-related questions.' };
    }

    if (!state.queryResults || state.queryResults.length === 0) {
      return { formattedAnswer: 'No cricket statistics found for your query. Please try a different question.' };
    }

    try {
      const prompt = `You are a cricket statistician. Format the following data as a human-readable response.

Question: "${state.question}"
Data: ${JSON.stringify(state.queryResults.slice(0, 15))}

Rules:
- If single result: plain text answer (e.g. "Brian Lara scored 400*")
- If multiple results: Markdown table with columns
- Include relevant emojis
- Do NOT include internal IDs

Respond with ONLY the formatted answer.`;

      const response = await this.llm.invoke(prompt);
      return { formattedAnswer: response.content as string };
    } catch (error) {
      this.logger.error(`[AnswerFormatter] Error: ${error.message}`);
      return { formattedAnswer: 'Error formatting answer. Please try again.' };
    }
  }

  // ─── Node 5: Final Response ───────────────────────────────────────────────────

  private async finalResponse(state: CricketState): Promise<Partial<CricketState>> {
    this.logger.log(`[FinalResponse] Sending answer`);
    return { formattedAnswer: state.formattedAnswer };
  }

  // ─── Build Workflow ───────────────────────────────────────────────────────────

  private buildWorkflow() {
    const workflow = new StateGraph(CricketStateAnnotation)
      .addNode('relevancyChecker', async (state) => this.relevancyChecker(state))
      .addNode('queryGenerator', async (state) => this.queryGenerator(state))
      .addNode('queryExecutor', async (state) => this.queryExecutor(state))
      .addNode('answerFormatter', async (state) => this.answerFormatter(state))
      .addNode('finalResponse', async (state) => this.finalResponse(state))
      .addEdge(START, 'relevancyChecker')
      .addEdge('relevancyChecker', 'queryGenerator')
      .addEdge('queryGenerator', 'queryExecutor')
      .addEdge('queryExecutor', 'answerFormatter')
      .addEdge('answerFormatter', 'finalResponse')
      .addEdge('finalResponse', END);

    return workflow.compile();
  }

  // ─── Main Execution ───────────────────────────────────────────────────────────

  async askQuestion(question: string): Promise<{ answer: string }> {
    this.logger.log(`[Workflow] Starting: ${question}`);

    const result = await this.workflow.invoke({
      question,
      isRelevant: false,
      generatedQuery: null,
      queryResults: [],
      formattedAnswer: '',
    });

    return { answer: result.formattedAnswer || 'No answer generated' };
  }
}
