import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CricketService {
  private readonly logger = new Logger(CricketService.name);

  constructor(
    @InjectModel('Test') private testModel: Model<any>,
    @InjectModel('ODI') private odiModel: Model<any>,
    @InjectModel('T20') private t20Model: Model<any>,
  ) {}

  async seedData(): Promise<{ message: string; counts: { test: number; odi: number; t20: number } }> {
    this.logger.log('Seeding cricket data into test, odi, t20 collections...');

    await this.testModel.deleteMany({});
    await this.odiModel.deleteMany({});
    await this.t20Model.deleteMany({});
    this.logger.log('Cleared existing data from all 3 collections');

    const possiblePaths = [
      path.join(process.cwd(), '..', 'data'),
      path.join(process.cwd(), '..', '..', 'data'),
      path.join(__dirname, '..', '..', '..', 'data'),
    ];

    let dataDir = possiblePaths[0];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) { dataDir = p; break; }
    }

    this.logger.log(`Using data directory: ${dataDir}`);

    const careerPath = path.join(dataDir, 'cric_players_year_by_year_career_summary.csv');
    const counts = { test: 0, odi: 0, t20: 0 };

    if (!fs.existsSync(careerPath)) {
      this.logger.warn(`CSV not found at: ${careerPath}`);
      return { message: 'CSV file not found', counts };
    }

    const lines = fs.readFileSync(careerPath, 'utf-8').trim().split('\n');
    const testRecords: any[] = [];
    const odiRecords: any[] = [];
    const t20Records: any[] = [];

    for (const line of lines) {
      const cols = line.split(',');
      if (cols.length < 15) continue;

      const parseNum = (val: string) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
      };

      const format = cols[14]?.trim() || '';
      const record = {
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
      };

      if (format === 'Test') testRecords.push(record);
      else if (format === 'ODI') odiRecords.push(record);
      else if (format === 'T20I') t20Records.push(record);
    }

    if (testRecords.length > 0) {
      await this.testModel.insertMany(testRecords, { ordered: false });
      counts.test = testRecords.length;
      this.logger.log(`Inserted ${testRecords.length} records into 'test' collection`);
    }

    if (odiRecords.length > 0) {
      await this.odiModel.insertMany(odiRecords, { ordered: false });
      counts.odi = odiRecords.length;
      this.logger.log(`Inserted ${odiRecords.length} records into 'odi' collection`);
    }

    if (t20Records.length > 0) {
      await this.t20Model.insertMany(t20Records, { ordered: false });
      counts.t20 = t20Records.length;
      this.logger.log(`Inserted ${t20Records.length} records into 't20' collection`);
    }

    return { message: 'Successfully seeded cricket data', counts };
  }
}
