import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireCreatorToPost } from '../middleware/roleAuth';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
} from '../controllers/postController';

const router = Router();

router.use(authenticate);

router.post('/', requireCreatorToPost, createPost);
router.get('/', getPosts);
router.get('/:postId', getPost);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;