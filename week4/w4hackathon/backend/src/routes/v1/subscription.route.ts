import express from 'express';
import * as subscriptionController from '../../controllers/subscription.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public: get available plans
router.get('/plans', subscriptionController.getPlans);

// Protected: subscription operations
router.get('/me', auth(), subscriptionController.getMySubscription);
router.post('/activate', auth(), subscriptionController.activateSubscription);
router.post('/free-trial-activate', auth(), subscriptionController.activateFreeTrial);

export default router;
