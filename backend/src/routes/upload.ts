import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo,
  getSignedUrl
} from '../controllers/uploadController';

const router = Router();

router.use(authenticate);

router.post('/single', uploadSingle, uploadSingleFile);
router.post('/multiple', uploadMultiple, uploadMultipleFiles);
router.delete('/:key', deleteFile);
router.get('/:key/info', getFileInfo);
router.get('/:key/signed-url', getSignedUrl);

export default router;