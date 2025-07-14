import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment
} from '../controllers/commentController';

const router = Router();

router.use(authenticate);

router.post('/posts/:postId', createComment);
router.get('/posts/:postId', getComments);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;