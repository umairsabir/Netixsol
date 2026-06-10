import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CricketController } from './cricket.controller';
import { CricketService } from './cricket.service';
import { CricketWorkflow } from '../ai/cricket.workflow';
import { PlayerStats, PlayerStatsSchema } from './schemas/player-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Test', schema: PlayerStatsSchema, collection: 'test' },
      { name: 'ODI', schema: PlayerStatsSchema, collection: 'odi' },
      { name: 'T20', schema: PlayerStatsSchema, collection: 't20' },
    ]),
  ],
  controllers: [CricketController],
  providers: [CricketService, CricketWorkflow],
  exports: [CricketService, CricketWorkflow],
})
export class CricketModule {}
