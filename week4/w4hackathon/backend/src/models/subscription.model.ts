import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin';
import paginate from './plugins/paginate.plugin';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    // Card details (simulated, not real payment)
    cardLast4: { type: String, default: null },
    cardBrand: { type: String, default: null },
    cardHolderName: { type: String, default: null },
  },
  { timestamps: true }
);

subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

// Index for fast lookup by user
subscriptionSchema.index({ userId: 1, isActive: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
