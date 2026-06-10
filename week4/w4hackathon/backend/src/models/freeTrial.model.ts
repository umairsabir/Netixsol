import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin';

const freeTrialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one free trial per user ever
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isUsed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

freeTrialSchema.plugin(toJSON);

const FreeTrial = mongoose.model('FreeTrial', freeTrialSchema);
export default FreeTrial;
