import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createSubscription,
  getMySubscriptions,
  getMySubscribers,
  cancelSubscription
} from '../controllers/subscriptionController';

const router = Router();

router.use(authenticate);

router.post('/', createSubscription);
router.get('/my-subscriptions', getMySubscriptions);
router.get('/my-subscribers', getMySubscribers);
router.patch('/:subscriptionId/cancel', cancelSubscription);

export default router;