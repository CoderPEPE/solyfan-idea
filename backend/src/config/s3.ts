import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const S3_CONFIG = {
  BUCKET_NAME: process.env.S3_BUCKET_NAME || 'solyfans-uploads',
  REGION: process.env.AWS_REGION || 'us-east-1',
  IMAGES_FOLDER: 'images/',
  VIDEOS_FOLDER: 'videos/',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '50000000'), // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
};