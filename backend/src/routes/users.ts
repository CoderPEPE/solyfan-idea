import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleAuth';
import {
  getProfile,
  getUserProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  updateUserRole,
  getAllUsers
} from '../controllers/userController';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.get('/all', authenticate, requireAdmin, getAllUsers);
router.get('/:userId', getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.patch('/deactivate', authenticate, deactivateAccount);
router.patch('/:userId/role', authenticate, requireAdmin, updateUserRole);

export default router;