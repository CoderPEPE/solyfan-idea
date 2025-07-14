import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, S3_CONFIG } from '../config/s3';

const storage = multerS3({
  s3: s3Client,
  bucket: S3_CONFIG.BUCKET_NAME,
  key: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    
    const folder = file.mimetype.startsWith('image/') ? S3_CONFIG.IMAGES_FOLDER : S3_CONFIG.VIDEOS_FOLDER;
    const key = `${folder}${filename}`;
    
    cb(null, key);
  },
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString()
    });
  },
  contentType: multerS3.AUTO_CONTENT_TYPE
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [...S3_CONFIG.ALLOWED_IMAGE_TYPES, ...S3_CONFIG.ALLOWED_VIDEO_TYPES];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: S3_CONFIG.MAX_FILE_SIZE
  }
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);