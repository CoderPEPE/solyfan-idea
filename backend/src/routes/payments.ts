import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPayment,
  processPayment,
  getMyPayments,
  refundPayment
} from '../controllers/paymentController';

const router = Router();

router.use(authenticate);

router.post('/', createPayment);
router.patch('/:paymentId/process', processPayment);
router.get('/my-payments', getMyPayments);
router.patch('/:paymentId/refund', refundPayment);

export default router;