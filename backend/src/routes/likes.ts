import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { toggleLike, getPostLikes } from '../controllers/likeController';

const router = Router();

router.use(authenticate);

router.post('/posts/:postId', toggleLike);
router.get('/posts/:postId', getPostLikes);

export default router;