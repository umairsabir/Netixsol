import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CricketController } from './cricket.controller';
import { CricketService } from './cricket.service';
import { CricketWorkflow } from '../ai/cricket.workflow';
import {
  CareerSummary,
  CareerSummarySchema,
} from './schemas/career-summary.schema';
import { PlayerMatch, PlayerMatchSchema } from './schemas/player-match.schema';
import { TeamMatch, TeamMatchSchema } from './schemas/team-match.schema';
import { QueryTrace, QueryTraceSchema } from './schemas/query-trace.schema';
import { PlayerInfo, PlayerInfoSchema } from './schemas/player-info.schema';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Summary, SummarySchema } from './schemas/summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerSummary.name, schema: CareerSummarySchema },
      { name: PlayerMatch.name, schema: PlayerMatchSchema },
      { name: TeamMatch.name, schema: TeamMatchSchema },
      { name: QueryTrace.name, schema: QueryTraceSchema },
      { name: PlayerInfo.name, schema: PlayerInfoSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Summary.name, schema: SummarySchema },
    ]),
  ],
  controllers: [CricketController],
  providers: [CricketService, CricketWorkflow],
  exports: [CricketService],
})
export class CricketModule {}
