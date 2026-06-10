import httpStatus from 'http-status';
import moment from 'moment';
import Subscription from '../models/subscription.model';
import FreeTrial from '../models/freeTrial.model';
import User from '../models/user.model';
import ApiError from '../utils/ApiError';
import { getPlanById } from './plan.service';

/**
 * Check whether a user currently has an active subscription or free trial
 */
export const hasActiveAccess = async (userId: string): Promise<boolean> => {
  const now = new Date();
  // Check subscription
  const sub = await Subscription.findOne({ userId, isActive: true, endDate: { $gt: now } });
  if (sub) return true;
  // Check free trial
  const trial = await FreeTrial.findOne({ userId, endDate: { $gt: now } });
  if (trial) return true;
  return false;
};

/**
 * Activate a paid subscription for a user
 */
export const activateSubscription = async (userId: string, planId: string, cardDetails: { cardNumber: string; cardHolderName: string; expiry: string; cvv: string }) => {
  const plan = await getPlanById(planId);
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  // Deactivate any existing active subscription
  await Subscription.updateMany({ userId, isActive: true }, { isActive: false });

  const startDate = new Date();
  const endDate = moment(startDate).add(plan.durationDays, 'days').toDate();
  const cardLast4 = cardDetails.cardNumber.replace(/\s/g, '').slice(-4);

  const subscription = await Subscription.create({
    userId,
    planId,
    startDate,
    endDate,
    isActive: true,
    cardLast4,
    cardBrand: 'card', // simplified for hackathon
    cardHolderName: cardDetails.cardHolderName,
  });

  // Link on user
  await User.findByIdAndUpdate(userId, { subscriptionId: subscription._id });

  return subscription;
};

/**
 * Get the user's active subscription (populated with plan)
 */
export const getUserSubscription = async (userId: string) => {
  return Subscription.findOne({ userId, isActive: true }).populate('planId');
};

/**
 * Activate a free trial for a user
 */
export const activateFreeTrial = async (userId: string) => {
  const existing = await FreeTrial.findOne({ userId });
  if (existing) throw new ApiError(httpStatus.BAD_REQUEST, 'Free trial already used');

  const startDate = new Date();
  const endDate = moment(startDate).add(7, 'days').toDate(); // 7-day trial

  const trial = await FreeTrial.create({ userId, startDate, endDate, isUsed: true });
  await User.findByIdAndUpdate(userId, { freeTrialId: trial._id });
  return trial;
};

/**
 * Get the user's free trial info
 */
export const getUserFreeTrial = async (userId: string) => {
  return FreeTrial.findOne({ userId });
};
