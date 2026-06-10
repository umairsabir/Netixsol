import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin';
import paginate from './plugins/paginate.plugin';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

planSchema.plugin(toJSON);
planSchema.plugin(paginate);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
