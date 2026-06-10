import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async get() {
    return this.settingModel.findOneAndUpdate(
      { key: 'default' },
      { $setOnInsert: { key: 'default' } },
      { new: true, upsert: true },
    );
  }

  async update(dto: UpdateSettingsDto) {
    return this.settingModel.findOneAndUpdate({ key: 'default' }, dto, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  }
}
