import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CareerSummary,
  CareerSummaryDocument,
} from '../cricket/schemas/career-summary.schema';
import {
  PlayerMatch,
  PlayerMatchDocument,
} from '../cricket/schemas/player-match.schema';
import {
  TeamMatch,
  TeamMatchDocument,
} from '../cricket/schemas/team-match.schema';
import {
  QueryTrace,
  QueryTraceDocument,
} from '../cricket/schemas/query-trace.schema';
import {
  PlayerInfo,
  PlayerInfoDocument,
} from '../cricket/schemas/player-info.schema';
import {
  Conversation,
  ConversationDocument,
} from '../cricket/schemas/conversation.schema';
import {
  Summary,
  SummaryDocument,
} from '../cricket/schemas/summary.schema';

// ─── State ────────────────────────────────────────────────────────────────────

const CricketStateAnnotation = Annotation.Root({
  queryId: Annotation<string>(),
  question: Annotation<string>(),
  userId: Annotation<string>(),
  isRelevant: Annotation<boolean>(),
  relevanceReason: Annotation<string>(),
  // Memory
  conversationHistory: Annotation<{ question: string; answer: string }[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  memorySummary: Annotation<string | null>(),
  // Query pipeline
  generatedQuery: Annotation<any>(),
  queryResults: Annotation<any[]>({
    default: () => [],
    reducer: (curr, update) => update ?? curr,
  }),
  formattedAnswer: Annotation<string>(),
  finalOutput: Annotation<{ answer: string; memoryUpdated: boolean; totalTurns: number }>({
    default: () => ({ answer: '', memoryUpdated: false, totalTurns: 0 }),
    reducer: (curr, update) => update ?? curr,
  }),
  // Tracing
  steps: Annotation<any[]>({
    default: () => [],
    reducer: (curr, update) => [...curr, ...(update || [])],
  }),
  error: Annotation<string | undefined>(),
});

type CricketState = typeof CricketStateAnnotation.State;

// ─── Workflow ──────────────────────────────────────────────────────────────────

@Injectable()
export class CricketWorkflow {
  private readonly logger = new Logger(CricketWorkflow.name);
  private llm: ChatGroq;
  private workflow: any;

  constructor(
    @InjectModel(CareerSummary.name)
    private careerSummaryModel: Model<CareerSummaryDocument>,
    @InjectModel(PlayerMatch.name)
    private playerMatchModel: Model<PlayerMatchDocument>,
    @InjectModel(TeamMatch.name)
    private teamMatchModel: Model<TeamMatchDocument>,
    @InjectModel(QueryTrace.name)
    private queryTraceModel: Model<QueryTraceDocument>,
    @InjectModel(PlayerInfo.name)
    private playerInfoModel: Model<PlayerInfoDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Summary.name)
    private summaryModel: Model<SummaryDocument>,
  ) {
    this.llm = new ChatGroq({
      model: 'llama-3.1-8b-instant',
      apiKey: process.env.GROQ_API_KEY,
    });
    this.workflow = this.buildWorkflow();
  }

  // ─── Node 1: Relevancy Checker ───────────────────────────────────────────────

  private async relevancyChecker(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[RelevancyChecker] Checking: ${state.question}`);

    try {
      const prompt = `You are a cricket statistics assistant. Determine if the following question is related to cricket statistics, cricket players, cricket matches, or cricket history.

Question: "${state.question}"

Consider the conversation history too — short follow-up questions like "And in Test?" or "What about ODI?" are cricket-related if the prior context was about cricket.

Respond with ONLY a JSON object:
{"isRelevant": true/false, "reason": "brief explanation"}`;

      const response = await this.llm.invoke(prompt);
      const content = response.content as string;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let result = { isRelevant: false, reason: 'Could not parse response' };

      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (e) {
          this.logger.warn(`[RelevancyChecker] JSON parse failed`);
        }
      }

      const cricketKeywords = [
        'cricket', 'test', 'odi', 't20', 'runs', 'wickets', 'player',
        'batting', 'bowling', 'average', 'strike rate', 'hundreds', 'fifties',
        'matches', 'innings',
      ];
      const hasCricketKeyword = cricketKeywords.some((kw) =>
        state.question.toLowerCase().includes(kw.toLowerCase()),
      );

      if (hasCricketKeyword && !result.isRelevant) {
        result.isRelevant = true;
        result.reason = 'Contains cricket-related keywords';
      }

      this.addStep(state, 'RelevancyChecker', state.question, result, startTime);

      return {
        isRelevant: result.isRelevant,
        relevanceReason: result.reason,
      };
    } catch (error) {
      this.logger.error(`[RelevancyChecker] Error: ${error.message}`);
      return {
        isRelevant: false,
        relevanceReason: 'Error checking relevance',
        error: error.message,
      };
    }
  }

  // ─── Node 2: Memory Retriever ────────────────────────────────────────────────

  private async memoryRetriever(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[MemoryRetriever] Loading memory for: ${state.userId}`);

    if (!state.isRelevant) {
      return { conversationHistory: [], memorySummary: null };
    }

    try {
      // Fetch the latest summary
      const summaryDoc = await this.summaryModel
        .findOne({ userId: state.userId })
        .lean()
        .exec();

      // Fetch last 10 conversation turns
      const turns = await this.conversationModel
        .find({ userId: state.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec();

      const history = turns.reverse().map((t: any) => ({
        question: t.question,
        answer: t.answer,
      }));

      this.addStep(
        state,
        'MemoryRetriever',
        { userId: state.userId },
        {
          turnCount: history.length,
          hasSummary: !!summaryDoc,
        },
        startTime,
      );

      return {
        conversationHistory: history,
        memorySummary: summaryDoc ? (summaryDoc as any).summary : null,
      };
    } catch (error) {
      this.logger.error(`[MemoryRetriever] Error: ${error.message}`);
      return { conversationHistory: [], memorySummary: null };
    }
  }

  // ─── Node 3: Query Generator ─────────────────────────────────────────────────

  private async queryGenerator(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[QueryGenerator] Generating query for: ${state.question}`);

    if (!state.isRelevant) {
      return { generatedQuery: null };
    }

    try {
      // 1. Player lookup via $text index
      let playerContext = '';
      try {
        const matchedPlayers = await this.playerInfoModel
          .find(
            { $text: { $search: state.question } },
            { score: { $meta: 'textScore' } },
          )
          .sort({ score: { $meta: 'textScore' } })
          .limit(3)
          .lean()
          .exec();

        if (matchedPlayers.length > 0) {
          playerContext = '\n\nIdentified Players in your database that match keywords in the question:\n';
          for (const p of matchedPlayers) {
            playerContext += `- ${(p as any).fullName || (p as any).name} has playerId: ${(p as any).playerId}\n`;
          }
          playerContext += 'IMPORTANT: Use this playerId in your MongoDB filter if the user is asking about this player (e.g. "filter": {"playerId": <ID>}).\n';
        }
      } catch (e) {
        this.logger.error(`[QueryGenerator] Player extraction error: ${e.message}`);
      }

      // 2. Build conversation memory context
      let memoryContext = '';
      if (state.memorySummary) {
        memoryContext += `\nConversation Summary:\n${state.memorySummary}\n`;
      }
      if (state.conversationHistory && state.conversationHistory.length > 0) {
        memoryContext += '\nRecent Conversation:\n';
        for (const turn of state.conversationHistory.slice(-5)) {
          memoryContext += `Q: ${turn.question}\nA: ${turn.answer.substring(0, 150)}...\n`;
        }
        memoryContext += '\nIMPORTANT: Use the above conversation context to understand follow-up questions. For example, if the previous question asked about "highest score in ODI" and the new question is "And in Test?", interpret it as "highest score in Test".\n';
      }

      const prompt = `Convert this cricket statistics question into a MongoDB query specification.
${playerContext}
${memoryContext}

Available collections:
- "careersummaries" - player career stats by year with fields: playerId, year, format ("Test"/"ODI"/"T20I"), matches, runs, highScore, average, hundreds, fifties, wickets, bestBowling, catches, stumpings
- "playermatches" - individual match performances with fields: playerId, matchDate, format, team, opposition, venue, runs, ballsFaced, strikeRate, wickets, economy
- "teammatches" - team match results with fields: team, opposition, matchDate, format, venue, result, margin, runs, wickets

Question: "${state.question}"

Respond ONLY with a JSON object specifying the query parameters:
{
  "collection": "careersummaries"/"playermatches"/"teammatches",
  "format": "Test"/"ODI"/"T20I"/null (null if not specified),
  "operation": "find"/"aggregate",
  "filter": { /* MongoDB filter object */ },
  "sort": { /* field: -1/1 */ },
  "limit": number or null,
  "projection": [ /* fields to return */ ] or null
}

Examples:
- "Top 5 run scorers in Test" → { "collection": "careersummaries", "format": "Test", "operation": "find", "filter": {}, "sort": { "runs": -1 }, "limit": 5, "projection": ["playerId", "runs", "average", "matches"] }
- "Who has highest average in ODI?" → { "collection": "careersummaries", "format": "ODI", "operation": "find", "filter": { "matches": { "$gte": 20 } }, "sort": { "average": -1 }, "limit": 1, "projection": ["playerId", "average", "runs", "matches"] }
- "Most wickets in T20" → { "collection": "careersummaries", "format": "T20I", "operation": "find", "filter": {}, "sort": { "wickets": -1 }, "limit": 1, "projection": ["playerId", "wickets", "matches"] }
- "India vs Australia matches in 2023" → { "collection": "teammatches", "format": null, "operation": "find", "filter": { "team": "India", "opposition": "Australia", "matchDate": { "$gte": "2023-01-01", "$lte": "2023-12-31" } }, "sort": { "matchDate": -1 }, "limit": 10, "projection": ["team", "opposition", "matchDate", "result", "margin"] }`;

      const response = await this.llm.invoke(prompt);
      const content = response.content as string;
      this.logger.log(`[QueryGenerator] LLM Output: ${content}`);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let generatedQuery: any = null;

      if (jsonMatch) {
        try {
          generatedQuery = JSON.parse(jsonMatch[0]);
        } catch (e) {
          this.logger.warn(`[QueryGenerator] JSON parse failed: ${e.message}`);
        }
      }

      if (!generatedQuery) {
        generatedQuery = this.fallbackQueryGeneration(state.question);
      }

      this.addStep(state, 'QueryGenerator', state.question, generatedQuery, startTime);
      return { generatedQuery };
    } catch (error) {
      this.logger.error(`[QueryGenerator] Error: ${error.message}`);
      return { generatedQuery: null, error: error.message };
    }
  }

  // ─── Fallback Query Generator ─────────────────────────────────────────────────

  private fallbackQueryGeneration(question: string): any {
    const q = question.toLowerCase();

    let format: string | null = null;
    if (q.includes('test')) format = 'Test';
    else if (q.includes('odi')) format = 'ODI';
    else if (q.includes('t20') || q.includes('t20i')) format = 'T20I';

    const teams = [
      'india', 'australia', 'england', 'pakistan', 'sri lanka', 'bangladesh',
      'new zealand', 'south africa', 'west indies', 'zimbabwe', 'afghanistan',
    ];
    const hasVsContext = q.includes('vs') || q.includes('against') || q.includes('match result') || q.includes('beat') || q.includes('won') || q.includes('lost');
    const mentionedTeams = teams.filter((t) => q.includes(t));
    const isTeamQuery = mentionedTeams.length >= 2 && hasVsContext;

    let sortField = 'runs';
    if (q.includes('wicket')) sortField = 'wickets';
    else if (q.includes('average')) sortField = 'average';
    else if (q.includes('strike')) sortField = 'strikeRate';
    else if (q.includes('hundred') || q.includes('century')) sortField = 'hundreds';
    else if (q.includes('fifty') || q.includes('fifties')) sortField = 'fifties';
    else if (q.includes('match')) sortField = 'matches';
    else if (q.includes('catch')) sortField = 'catches';

    const limitMatch = q.match(/top\s*(\d+)/);
    const limit = limitMatch ? parseInt(limitMatch[1]) : 5;

    const filter: any = {};
    if (format) filter.format = format;

    if (isTeamQuery) {
      return {
        collection: 'teammatches',
        format,
        operation: 'find',
        filter,
        sort: { matchDate: -1 },
        limit,
        projection: ['team', 'opposition', 'matchDate', 'result', 'margin'],
      };
    }

    return {
      collection: 'careersummaries',
      format,
      operation: 'find',
      filter,
      sort: { [sortField]: -1 },
      limit,
      projection: [
        'playerId', 'year', 'format', 'matches', 'runs', 'average',
        'strike_rate', 'hundreds', 'fifties', 'wickets', 'catches',
      ],
    };
  }

  // ─── Node 4: Query Executor ───────────────────────────────────────────────────

  private async queryExecutor(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[QueryExecutor] Executing query`);

    if (!state.generatedQuery) {
      return { queryResults: [] };
    }

    try {
      const { collection, format, filter, sort, limit, projection } =
        state.generatedQuery;

      const queryFilter = { ...filter };
      if (format && !queryFilter.format) {
        queryFilter.format = format;
      }

      let model: any = this.careerSummaryModel;
      if (collection === 'playermatches') {
        model = this.playerMatchModel;
      } else if (collection === 'teammatches') {
        model = this.teamMatchModel;
      }

      this.logger.log(`[QueryExecutor] Filter: ${JSON.stringify(queryFilter)}`);
      this.logger.log(`[QueryExecutor] Sort: ${JSON.stringify(sort)}`);
      this.logger.log(`[QueryExecutor] Collection: ${collection}`);

      let query = model.find(queryFilter || {});

      if (sort) {
        query = query.sort(sort);
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (projection && Array.isArray(projection)) {
        const projObj = projection.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {},
        );
        query = query.select(projObj);
      }

      const results = await query.lean().exec();

      // Attach player names
      if (results.length > 0 && results[0].playerId !== undefined) {
        const playerIds: number[] = Array.from(
          new Set<number>(results.map((r: any) => Number(r.playerId))),
        );
        const players = await this.playerInfoModel
          .find({ playerId: { $in: playerIds } })
          .lean()
          .exec();
        const playerMap = new Map<number, string>();
        for (const p of players as any[]) {
          playerMap.set(Number(p.playerId), p.fullName || p.name);
        }

        this.logger.log(
          `[QueryExecutor] Found ${players.length} players for ${playerIds.length} IDs`,
        );

        for (const r of results as any[]) {
          if (r.playerId !== undefined) {
            const pid = Number(r.playerId);
            r.playerName = playerMap.get(pid) || `Player ${pid}`;
            delete r.playerId;
          }
          delete r._id;
          delete r.__v;
        }
      }

      // Also strip IDs when there are no playerIds (team matches etc.)
      for (const r of results as any[]) {
        delete r._id;
        delete r.__v;
        if (r.playerId !== undefined) delete r.playerId;
      }

      this.logger.log(
        `[QueryExecutor] Found ${results.length} results`,
      );

      this.addStep(
        state,
        'QueryExecutor',
        state.generatedQuery,
        { count: results.length, collection },
        startTime,
      );

      return { queryResults: results };
    } catch (error) {
      this.logger.error(`[QueryExecutor] Error: ${error.message}`);
      return { queryResults: [], error: error.message };
    }
  }

  // ─── Node 5: Answer Formatter ─────────────────────────────────────────────────

  private async answerFormatter(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[AnswerFormatter] Formatting answer`);

    if (!state.isRelevant) {
      const answer = `Sorry, I can only answer cricket-related questions. (${state.relevanceReason})`;
      this.addStep(state, 'AnswerFormatter', null, { answer }, startTime);
      return { formattedAnswer: answer };
    }

    if (!state.queryResults || state.queryResults.length === 0) {
      const answer =
        'No cricket statistics found for your query. Please try a different question.';
      this.addStep(state, 'AnswerFormatter', null, { answer }, startTime);
      return { formattedAnswer: answer };
    }

    try {
      // Build memory context for the answer formatter
      let memoryContext = '';
      if (state.memorySummary || (state.conversationHistory && state.conversationHistory.length > 0)) {
        memoryContext = '\n\nConversation Context (use this to understand pronouns like "him", "his", "that player"):';
        if (state.memorySummary) {
          memoryContext += `\nSummary: ${state.memorySummary}`;
        }
        if (state.conversationHistory && state.conversationHistory.length > 0) {
          memoryContext += '\nRecent turns:';
          for (const turn of state.conversationHistory.slice(-3)) {
            memoryContext += `\nQ: ${turn.question}\nA: ${turn.answer.substring(0, 200)}`;
          }
        }
      }

      const prompt = `You are an expert cricket statistician and historian.
Your task is to take the raw database query results for a user's question and format them into a beautiful, human-readable Markdown response.

User Question: "${state.question}"
Database Results: ${JSON.stringify(state.queryResults.slice(0, 15))}
${memoryContext}

CRITICAL INSTRUCTIONS:
1. The database results contain "playerName" which is the REAL name of the player. ALWAYS use "playerName" when referring to any player.
2. NEVER guess, infer, or hallucinate player names. If playerName is missing, say "Unknown Player".
3. DO NOT include any internal database IDs, player IDs, or MongoDB ObjectIds in your response.
4. Use the conversation context above to resolve pronouns and follow-up references.

Formatting Rules:
1. Use standard Markdown tables for multiple records (include spaces around the | separators).
2. For a single record, use a clean card-like format with bold text.
3. Include relevant emojis (🏏, 🎯, 📊, etc.).
4. If it's team matches, format the match results clearly with dates.
5. Do NOT include any internal IDs in the response.

Provide ONLY the final formatted Markdown response.`;

      const response = await this.llm.invoke(prompt);
      const formattedAnswer = response.content as string;

      this.addStep(
        state,
        'AnswerFormatter',
        state.queryResults,
        { answer: formattedAnswer.substring(0, 100) + '...' },
        startTime,
      );

      return { formattedAnswer };
    } catch (error) {
      this.logger.error(`[AnswerFormatter] Error: ${error.message}`);
      return { formattedAnswer: 'Error formatting answer. Please try again.' };
    }
  }

  // ─── Node 6: Memory Saver ─────────────────────────────────────────────────────

  private async memorySaver(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[MemorySaver] Saving memory for: ${state.userId}`);

    if (!state.isRelevant || !state.formattedAnswer) {
      return {};
    }

    try {
      // 1. Save the current turn
      await this.conversationModel.create({
        userId: state.userId,
        question: state.question,
        answer: state.formattedAnswer,
      });

      // 2. Count total turns for this user
      const totalTurns = await this.conversationModel.countDocuments({
        userId: state.userId,
      });

      this.logger.log(`[MemorySaver] Total turns for ${state.userId}: ${totalTurns}`);

      // 3. Summarise if >= 10 turns, then delete old conversations (keep last 5)
      if (totalTurns >= 10) {
        const allTurns = await this.conversationModel
          .find({ userId: state.userId })
          .sort({ createdAt: 1 })
          .lean()
          .exec();

        const historyText = allTurns
          .map((t: any) => `Q: ${t.question}\nA: ${t.answer.substring(0, 200)}`)
          .join('\n---\n');

        const summaryPrompt = `You are a memory summarizer for a cricket statistics chatbot.
Summarize the following conversation history into a concise paragraph (max 5 sentences) that captures the key topics, players, and statistics discussed. This summary will be used as context for future questions.

Conversation:
${historyText}

Respond ONLY with the summary paragraph.`;

        const summaryResponse = await this.llm.invoke(summaryPrompt);
        const newSummary = (summaryResponse.content as string).trim();

        await this.summaryModel.findOneAndUpdate(
          { userId: state.userId },
          { summary: newSummary, turnCount: totalTurns },
          { upsert: true, new: true },
        );

        // Delete old conversations — keep only last 5, rest replaced by summary
        const keepIds = allTurns.slice(-5).map((t: any) => t._id);
        await this.conversationModel.deleteMany({
          userId: state.userId,
          _id: { $nin: keepIds },
        });

        this.logger.log(`[MemorySaver] Summary updated, old conversations pruned for ${state.userId}`);
      }

      this.addStep(
        state,
        'MemorySaver',
        { userId: state.userId },
        { saved: true, totalTurns },
        startTime,
      );

      return {};
    } catch (error) {
      this.logger.error(`[MemorySaver] Error: ${error.message}`);
      return {};
    }
  }

  // ─── Node 7: Final Response ───────────────────────────────────────────────────

  private async finalResponseNode(
    state: CricketState,
  ): Promise<Partial<CricketState>> {
    const startTime = Date.now();
    this.logger.log(`[FinalResponse] Building final response`);

    const totalTurns = await this.conversationModel
      .countDocuments({ userId: state.userId })
      .exec();

    const memoryUpdated = state.isRelevant && !!state.formattedAnswer;

    this.addStep(
      state,
      'FinalResponse',
      { question: state.question },
      { answer: state.formattedAnswer?.substring(0, 100) + '...', memoryUpdated, totalTurns },
      startTime,
    );

    return {
      finalOutput: {
        answer: state.formattedAnswer || 'No answer generated',
        memoryUpdated,
        totalTurns,
      },
    };
  }

  // ─── Build Workflow ───────────────────────────────────────────────────────────

  private buildWorkflow() {
    const workflow = new StateGraph(CricketStateAnnotation)
      .addNode('relevancyChecker', async (state) =>
        this.relevancyChecker(state),
      )
      .addNode('memoryRetriever', async (state) =>
        this.memoryRetriever(state),
      )
      .addNode('queryGenerator', async (state) =>
        this.queryGenerator(state),
      )
      .addNode('queryExecutor', async (state) =>
        this.queryExecutor(state),
      )
      .addNode('answerFormatter', async (state) =>
        this.answerFormatter(state),
      )
      .addNode('memorySaver', async (state) =>
        this.memorySaver(state),
      )
      .addNode('finalResponseNode', async (state) =>
        this.finalResponseNode(state),
      )
      .addEdge(START, 'relevancyChecker')
      .addEdge('relevancyChecker', 'memoryRetriever')
      .addEdge('memoryRetriever', 'queryGenerator')
      .addEdge('queryGenerator', 'queryExecutor')
      .addEdge('queryExecutor', 'answerFormatter')
      .addEdge('answerFormatter', 'memorySaver')
      .addEdge('memorySaver', 'finalResponseNode')
      .addEdge('finalResponseNode', END);

    return workflow.compile();
  }

  // ─── Main Execution ───────────────────────────────────────────────────────────

  async askQuestion(
    question: string,
    userId: string = 'anonymous',
  ): Promise<{ answer: string; trace: QueryTrace }> {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const initialState: CricketState = {
      queryId,
      question,
      userId,
      isRelevant: false,
      relevanceReason: '',
      conversationHistory: [],
      memorySummary: null,
      generatedQuery: null,
      queryResults: [],
      formattedAnswer: '',
      steps: [],
      error: undefined,
      finalOutput: { answer: '', memoryUpdated: false, totalTurns: 0 },
    };

    this.logger.log(`[Workflow] Starting: ${question} (userId: ${userId})`);

    try {
      const result = await this.workflow.invoke(initialState);

      const trace = new this.queryTraceModel({
        queryId,
        originalQuestion: question,
        steps: result.steps,
        isRelevant: result.isRelevant,
        generatedQuery: result.generatedQuery,
        queryResults: result.queryResults,
        formattedAnswer: result.formattedAnswer,
        status: result.error ? 'error' : 'completed',
      });

      await trace.save();

      return {
        answer: result.finalOutput?.answer || result.formattedAnswer || 'No answer generated',
        trace,
      };
    } catch (error) {
      this.logger.error(`[Workflow] Error: ${error.message}`);
      throw error;
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private addStep(
    state: CricketState,
    stepName: string,
    input: any,
    output: any,
    startTime: number,
  ) {
    const duration = Date.now() - startTime;
    state.steps.push({
      step: stepName,
      timestamp: new Date(),
      input,
      output,
      duration,
    });
    this.logger.log(`[${stepName}] Completed in ${duration}ms`);
  }
}
