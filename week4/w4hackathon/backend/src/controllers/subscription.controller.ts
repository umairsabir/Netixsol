import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { subscriptionService, planService } from '../services';

// ─── Plans (public) ────────────────────────────────────────────────────────────

export const getPlans = catchAsync(async (_req, res) => {
  const plans = await planService.queryPlans(true);
  res.send(plans);
});

// ─── Subscription ─────────────────────────────────────────────────────────────

export const activateSubscription = catchAsync(async (req: any, res) => {
  const { planId, cardNumber, cardHolderName, expiry, cvv } = req.body;
  const subscription = await subscriptionService.activateSubscription(req.user.id, planId, {
    cardNumber, cardHolderName, expiry, cvv,
  });
  res.status(httpStatus.CREATED).send(subscription);
});

export const getMySubscription = catchAsync(async (req: any, res) => {
  const subscription = await subscriptionService.getUserSubscription(req.user.id);
  const freeTrial = await subscriptionService.getUserFreeTrial(req.user.id);
  res.send({ subscription, freeTrial });
});

// ─── Free Trial ───────────────────────────────────────────────────────────────

export const activateFreeTrial = catchAsync(async (req: any, res) => {
  const trial = await subscriptionService.activateFreeTrial(req.user.id);
  res.status(httpStatus.CREATED).send(trial);
});
