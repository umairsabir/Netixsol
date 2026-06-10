import httpStatus from 'http-status';
import Plan from '../models/plan.model';
import ApiError from '../utils/ApiError';

export const createPlan = async (data: { name: string; price: number; durationDays: number; features?: string[] }) => {
  return Plan.create(data);
};

export const queryPlans = async (onlyActive = true) => {
  const filter = onlyActive ? { isActive: true } : {};
  return Plan.find(filter).sort({ price: 1 });
};

export const getPlanById = async (id: string) => {
  const plan = await Plan.findById(id);
  if (!plan) throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  return plan;
};

export const updatePlan = async (id: string, data: Partial<{ name: string; price: number; durationDays: number; features: string[]; isActive: boolean }>) => {
  const plan = await getPlanById(id);
  Object.assign(plan, data);
  await plan.save();
  return plan;
};

export const deletePlan = async (id: string) => {
  const plan = await getPlanById(id);
  await plan.deleteOne();
};
