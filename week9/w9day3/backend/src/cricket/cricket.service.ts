import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CareerSummary,
  CareerSummaryDocument,
} from './schemas/career-summary.schema';
import {
  PlayerMatch,
  PlayerMatchDocument,
} from './schemas/player-match.schema';
import { TeamMatch, TeamMatchDocument } from './schemas/team-match.schema';
import { QueryTrace, QueryTraceDocument } from './schemas/query-trace.schema';
import { PlayerInfo, PlayerInfoDocument } from './schemas/player-info.schema';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Summary, SummaryDocument } from './schemas/summary.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CricketService {
  private readonly logger = new Logger(CricketService.name);

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
  ) {}

  async seedData(): Promise<{
    message: string;
    counts: { career: number; playerMatch: number; teamMatch: number; playerInfo: number };
  }> {
    this.logger.log('Seeding cricket data from CSV files...');

    // Clear existing data
    await this.careerSummaryModel.deleteMany({});
    await this.playerMatchModel.deleteMany({});
    await this.teamMatchModel.deleteMany({});
    await this.playerInfoModel.deleteMany({});
    this.logger.log('Cleared existing cricket data');

    // Try multiple possible paths for data directory
    const possiblePaths = [
      path.join(process.cwd(), '..', 'data'), // dev mode
      path.join(process.cwd(), '..', '..', 'data'), // dist mode
      path.join(__dirname, '..', '..', '..', 'data'), // relative to compiled file
      '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/data', // absolute fallback
    ];

    let dataDir = possiblePaths[0];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dataDir = p;
        break;
      }
    }

    this.logger.log(`Using data directory: ${dataDir}`);
    const counts = { career: 0, playerMatch: 0, teamMatch: 0, playerInfo: 0 };

    // Seed Player Info
    const playerInfoPath = path.join(dataDir, 'player_info.csv');
    if (fs.existsSync(playerInfoPath)) {
      const lines = fs.readFileSync(playerInfoPath, 'utf-8').trim().split('\n');
      const records: any[] = [];
      for (const line of lines) {
        // Simple CSV split (handling commas not in quotes would be better, but basic split usually works for numeric IDs)
        // Note: Full names might contain commas, but since we are just doing a basic split, we grab up to country
        const cols = line.split(',');
        if (cols.length >= 3) {
          records.push({
            playerId: parseInt(cols[0]) || 0,
            name: cols[1]?.trim() || '',
            fullName: cols[2]?.trim() || '',
            country: cols[6]?.trim() || '',
          });
        }
      }
      if (records.length > 0) {
        // remove duplicates by ID if any
        const uniqueRecords = Array.from(new Map(records.map(item => [item.playerId, item])).values());
        await this.playerInfoModel.insertMany(uniqueRecords, { ordered: false });
        counts.playerInfo = uniqueRecords.length;
        this.logger.log(`Inserted ${uniqueRecords.length} player info records`);
      }
    }

    // Seed Career Summary
    const careerPath = path.join(
      dataDir,
      'cric_players_year_by_year_career_summary.csv',
    );
    if (fs.existsSync(careerPath)) {
      const lines = fs.readFileSync(careerPath, 'utf-8').trim().split('\n');
      const records: any[] = [];

      for (const line of lines) {
        const cols = line.split(',');
        if (cols.length >= 15) {
          const parseNum = (val: string) => {
            const n = parseFloat(val);
            return isNaN(n) ? 0 : n;
          };
          records.push({
            playerId: parseNum(cols[0]),
            year: parseNum(cols[1]),
            matches: parseNum(cols[2]),
            runs: parseNum(cols[3]),
            highScore: cols[4]?.trim() || '',
            average: parseNum(cols[5]),
            hundreds: parseNum(cols[6]),
            fifties: parseNum(cols[7]),
            wickets: parseNum(cols[8]),
            bestBowling: cols[9]?.trim() || '',
            bowlingAverage: parseNum(cols[10]),
            catches: parseNum(cols[11]),
            stumpings: parseNum(cols[12]),
            allRounderRating: parseNum(cols[13]),
            format: cols[14]?.trim() || 'Unknown',
          });
        }
      }

      if (records.length > 0) {
        await this.careerSummaryModel.insertMany(records, { ordered: false });
        counts.career = records.length;
        this.logger.log(`Inserted ${records.length} career summary records`);

        // Verify data was inserted
        const testCount = await this.careerSummaryModel.countDocuments({
          format: 'Test',
        });
        const odiCount = await this.careerSummaryModel.countDocuments({
          format: 'ODI',
        });
        const t20Count = await this.careerSummaryModel.countDocuments({
          format: 'T20I',
        });
        this.logger.log(
          `Verification - Test: ${testCount}, ODI: ${odiCount}, T20I: ${t20Count}`,
        );

        // Show sample record
        const sample = await this.careerSummaryModel
          .findOne({ format: 'Test' })
          .lean();
        this.logger.log(
          `Sample Test record: ${JSON.stringify(sample).substring(0, 200)}`,
        );
      }
    }

    // Seed Player Match by Match (sample - too large for full seed)
    const playerMatchPath = path.join(
      dataDir,
      'cric_players_match_by_match.csv',
    );
    if (fs.existsSync(playerMatchPath)) {
      const lines = fs
        .readFileSync(playerMatchPath, 'utf-8')
        .trim()
        .split('\n');
      const records: any[] = [];

      // Seed first 5000 records as sample
      for (let i = 0; i < Math.min(5000, lines.length); i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 33) {
          records.push({
            playerId: parseInt(cols[0]) || 0,
            matchDate: new Date(cols[1]),
            format: cols[2] || 'Unknown',
            team: cols[3] || '',
            opposition: cols[4] || '',
            venue: cols[5] || '',
            matchResult: cols[6] || '',
            innings: parseInt(cols[7]) || 0,
            dismissal: cols[8] || '',
            runs: parseInt(cols[9]) || 0,
            minutes: parseInt(cols[10]) || 0,
            ballsFaced: parseInt(cols[11]) || 0,
            fours: parseInt(cols[12]) || 0,
            sixes: parseInt(cols[13]) || 0,
            strikeRate: parseFloat(cols[14]) || 0,
            inns: parseInt(cols[15]) || 0,
            overs: parseFloat(cols[16]) || 0,
            maidens: parseInt(cols[17]) || 0,
            runsConceded: parseInt(cols[18]) || 0,
            wickets: parseInt(cols[19]) || 0,
            economy: parseFloat(cols[20]) || 0,
            position: parseInt(cols[21]) || 0,
            matchId: cols[25] || '',
            season: parseInt(cols[26]) || 0,
          });
        }
      }

      if (records.length > 0) {
        await this.playerMatchModel.insertMany(records, { ordered: false });
        counts.playerMatch = records.length;
        this.logger.log(
          `Inserted ${records.length} player match records (sample)`,
        );
      }
    }

    // Seed Team Match
    const teamMatchPath = path.join(dataDir, 'team_match_by_match.csv');
    if (fs.existsSync(teamMatchPath)) {
      const lines = fs.readFileSync(teamMatchPath, 'utf-8').trim().split('\n');
      const records: any[] = [];

      for (const line of lines) {
        const cols = line.split(',');
        if (cols.length >= 13) {
          records.push({
            team: cols[0] || '',
            opposition: cols[1] || '',
            matchDate: new Date(cols[2]),
            format: cols[3] || 'Unknown',
            venue: cols[4] || '',
            result: cols[5] || '',
            margin: cols[6] || '',
            toss: cols[7] || '',
            battingInnings: cols[8] || '',
            runs: parseInt(cols[9]) || 0,
            wickets: parseInt(cols[10]) || 0,
            overs: parseFloat(cols[11]) || 0,
            runRate: parseFloat(cols[12]) || 0,
          });
        }
      }

      if (records.length > 0) {
        await this.teamMatchModel.insertMany(records, { ordered: false });
        counts.teamMatch = records.length;
        this.logger.log(`Inserted ${records.length} team match records`);
      }
    }

    return {
      message: 'Successfully seeded cricket data',
      counts,
    };
  }

  async getStats(): Promise<{
    career: number;
    playerMatch: number;
    teamMatch: number;
    playerInfo: number;
  }> {
    const [career, playerMatch, teamMatch, playerInfo] = await Promise.all([
      this.careerSummaryModel.countDocuments(),
      this.playerMatchModel.countDocuments(),
      this.teamMatchModel.countDocuments(),
      this.playerInfoModel.countDocuments(),
    ]);

    return { career, playerMatch, teamMatch, playerInfo };
  }

  async findAllTraces(): Promise<QueryTrace[]> {
    return this.queryTraceModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  async findTraceByQueryId(queryId: string): Promise<QueryTrace | null> {
    return this.queryTraceModel.findOne({ queryId }).exec();
  }

  async getHistory(
    userId: string,
    limit = 20,
  ): Promise<{ userId: string; history: any[] }> {
    const turns = await this.conversationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return { userId, history: turns.reverse() };
  }

  async getSummary(userId: string): Promise<any> {
    return this.summaryModel.findOne({ userId }).lean().exec();
  }
}
