import request from 'supertest';
import express from 'express';
import cors from 'cors';
import uploadRoutes from '../../src/routes/upload';
import { createTestUser, getAuthHeader } from '../utils/testHelpers';

// Mock AWS S3 services
jest.mock('../../src/config/s3', () => ({
  s3Client: {},
  S3_CONFIG: {
    BUCKET_NAME: 'test-bucket',
    REGION: 'us-east-1',
    IMAGES_FOLDER: 'images/',
    VIDEOS_FOLDER: 'videos/',
    MAX_FILE_SIZE: 50000000,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
  }
}));

jest.mock('../../src/services/s3Service', () => ({
  deleteFile: jest.fn().mockResolvedValue(undefined),
  getFileInfo: jest.fn().mockResolvedValue({
    size: 1024000,
    lastModified: new Date(),
    contentType: 'image/jpeg'
  }),
  getSignedUrl: jest.fn().mockResolvedValue('https://test-bucket.s3.us-east-1.amazonaws.com/signed-url'),
  getPublicUrl: jest.fn().mockReturnValue('https://test-bucket.s3.us-east-1.amazonaws.com/test-file.jpg')
}));

// Mock multer middleware to simulate file uploads
jest.mock('../../src/middleware/upload', () => ({
  uploadSingle: (req: any, res: any, next: any) => {
    // Mock single file upload
    req.file = {
      key: 'images/test-uuid.jpg',
      location: 'https://test-bucket.s3.us-east-1.amazonaws.com/images/test-uuid.jpg',
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024000,
      bucket: 'test-bucket'
    };
    next();
  },
  uploadMultiple: (req: any, res: any, next: any) => {
    // Mock multiple file upload
    req.files = [
      {
        key: 'images/test-uuid-1.jpg',
        location: 'https://test-bucket.s3.us-east-1.amazonaws.com/images/test-uuid-1.jpg',
        originalname: 'test-image-1.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        bucket: 'test-bucket'
      },
      {
        key: 'videos/test-uuid-2.mp4',
        location: 'https://test-bucket.s3.us-east-1.amazonaws.com/videos/test-uuid-2.mp4',
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        size: 5120000,
        bucket: 'test-bucket'
      }
    ];
    next();
  }
}));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRoutes);

describe('File Upload', () => {
  let user: any;

  beforeEach(async () => {
    user = await createTestUser('uploader@example.com', 'password123', 'creator');
  });

  describe('POST /api/upload/single', () => {
    it('should upload single file successfully', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(user.token))
        .attach('file', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.message).toBe('File uploaded successfully');
      expect(response.body.file).toBeDefined();
      expect(response.body.file.key).toBe('images/test-uuid.jpg');
      expect(response.body.file.filename).toBe('test-uuid.jpg');
      expect(response.body.file.originalName).toBe('test-image.jpg');
      expect(response.body.file.mimetype).toBe('image/jpeg');
      expect(response.body.file.size).toBe(1024000);
      expect(response.body.file.url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/images/test-uuid.jpg');
      expect(response.body.file.publicUrl).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test-file.jpg');
    });

    it('should reject upload without file', async () => {
      // Mock no file uploaded
      jest.doMock('../../src/middleware/upload', () => ({
        uploadSingle: (req: any, res: any, next: any) => {
          req.file = null;
          next();
        }
      }));

      const response = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(user.token))
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .attach('file', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(401);
    });
  });

  describe('POST /api/upload/multiple', () => {
    it('should upload multiple files successfully', async () => {
      const response = await request(app)
        .post('/api/upload/multiple')
        .set(getAuthHeader(user.token))
        .attach('files', Buffer.from('fake image data'), 'test-image-1.jpg')
        .attach('files', Buffer.from('fake video data'), 'test-video.mp4')
        .expect(200);

      expect(response.body.message).toBe('Files uploaded successfully');
      expect(response.body.files).toBeDefined();
      expect(Array.isArray(response.body.files)).toBe(true);
      expect(response.body.files.length).toBe(2);
      
      // Check first file (image)
      expect(response.body.files[0].key).toBe('images/test-uuid-1.jpg');
      expect(response.body.files[0].mimetype).toBe('image/jpeg');
      
      // Check second file (video)
      expect(response.body.files[1].key).toBe('videos/test-uuid-2.mp4');
      expect(response.body.files[1].mimetype).toBe('video/mp4');
    });

    it('should reject upload without files', async () => {
      // Mock no files uploaded
      jest.doMock('../../src/middleware/upload', () => ({
        uploadMultiple: (req: any, res: any, next: any) => {
          req.files = [];
          next();
        }
      }));

      const response = await request(app)
        .post('/api/upload/multiple')
        .set(getAuthHeader(user.token))
        .expect(400);

      expect(response.body.error).toBe('No files uploaded');
    });
  });

  describe('DELETE /api/upload/:key', () => {
    it('should delete file successfully', async () => {
      const fileKey = 'images/test-uuid.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/${encodeURIComponent(fileKey)}`)
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.message).toBe('File deleted successfully');
    });

    it('should return error for missing file key', async () => {
      const response = await request(app)
        .delete('/api/upload/')
        .set(getAuthHeader(user.token))
        .expect(404); // Route not found
    });

    it('should handle file not found error', async () => {
      // Mock S3 service to throw not found error
      const s3Service = require('../../src/services/s3Service');
      s3Service.deleteFile.mockRejectedValueOnce(new Error('File not found'));

      const fileKey = 'images/non-existent.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/${encodeURIComponent(fileKey)}`)
        .set(getAuthHeader(user.token))
        .expect(404);

      expect(response.body.error).toBe('File not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/upload/images%2Ftest.jpg')
        .expect(401);
    });
  });

  describe('GET /api/upload/:key/info', () => {
    it('should get file info successfully', async () => {
      const fileKey = 'images/test-uuid.jpg';
      
      const response = await request(app)
        .get(`/api/upload/${encodeURIComponent(fileKey)}/info`)
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.key).toBe(fileKey);
      expect(response.body.filename).toBe('test-uuid.jpg');
      expect(response.body.size).toBe(1024000);
      expect(response.body.contentType).toBe('image/jpeg');
      expect(response.body.lastModified).toBeDefined();
      expect(response.body.url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test-file.jpg');
    });

    it('should handle file not found error', async () => {
      // Mock S3 service to throw not found error
      const s3Service = require('../../src/services/s3Service');
      s3Service.getFileInfo.mockRejectedValueOnce(new Error('File not found in S3'));

      const fileKey = 'images/non-existent.jpg';
      
      const response = await request(app)
        .get(`/api/upload/${encodeURIComponent(fileKey)}/info`)
        .set(getAuthHeader(user.token))
        .expect(404);

      expect(response.body.error).toBe('File not found');
    });

    it('should require file key', async () => {
      const response = await request(app)
        .get('/api/upload//info')
        .set(getAuthHeader(user.token))
        .expect(400);

      expect(response.body.error).toBe('File key is required');
    });
  });

  describe('GET /api/upload/:key/signed-url', () => {
    it('should generate signed URL successfully', async () => {
      const fileKey = 'images/test-uuid.jpg';
      
      const response = await request(app)
        .get(`/api/upload/${encodeURIComponent(fileKey)}/signed-url`)
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.signedUrl).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/signed-url');
      expect(response.body.expiresIn).toBe(3600); // Default expiration
      expect(response.body.expiresAt).toBeDefined();
    });

    it('should support custom expiration time', async () => {
      const fileKey = 'images/test-uuid.jpg';
      const customExpiry = 7200; // 2 hours
      
      const response = await request(app)
        .get(`/api/upload/${encodeURIComponent(fileKey)}/signed-url?expiresIn=${customExpiry}`)
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.expiresIn).toBe(customExpiry);
    });

    it('should require file key', async () => {
      const response = await request(app)
        .get('/api/upload//signed-url')
        .set(getAuthHeader(user.token))
        .expect(400);

      expect(response.body.error).toBe('File key is required');
    });

    it('should handle S3 service errors', async () => {
      // Mock S3 service to throw error
      const s3Service = require('../../src/services/s3Service');
      s3Service.getSignedUrl.mockRejectedValueOnce(new Error('Failed to generate signed URL'));

      const fileKey = 'images/test-uuid.jpg';
      
      const response = await request(app)
        .get(`/api/upload/${encodeURIComponent(fileKey)}/signed-url`)
        .set(getAuthHeader(user.token))
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('File Type Validation', () => {
    it('should handle image file uploads', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(user.token))
        .attach('file', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.file.key).toContain('images/');
    });

    it('should handle video file uploads', async () => {
      // Mock video file upload
      jest.doMock('../../src/middleware/upload', () => ({
        uploadSingle: (req: any, res: any, next: any) => {
          req.file = {
            key: 'videos/test-uuid.mp4',
            location: 'https://test-bucket.s3.us-east-1.amazonaws.com/videos/test-uuid.mp4',
            originalname: 'test-video.mp4',
            mimetype: 'video/mp4',
            size: 5120000,
            bucket: 'test-bucket'
          };
          next();
        }
      }));

      const response = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(user.token))
        .attach('file', Buffer.from('fake video data'), 'test-video.mp4')
        .expect(200);

      expect(response.body.file.key).toContain('videos/');
    });
  });

  describe('Error Handling', () => {
    it('should handle S3 service errors gracefully', async () => {
      // Mock S3 service to throw error
      const s3Service = require('../../src/services/s3Service');
      s3Service.deleteFile.mockRejectedValueOnce(new Error('S3 service error'));

      const response = await request(app)
        .delete('/api/upload/images%2Ftest.jpg')
        .set(getAuthHeader(user.token))
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle malformed file keys', async () => {
      const response = await request(app)
        .get('/api/upload/malformed-key/info')
        .set(getAuthHeader(user.token))
        .expect(200);

      // Should still process the request, S3 service will handle validation
      expect(response.body.key).toBe('malformed-key');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all upload operations', async () => {
      await request(app).post('/api/upload/single').expect(401);
      await request(app).post('/api/upload/multiple').expect(401);
      await request(app).delete('/api/upload/test-key').expect(401);
      await request(app).get('/api/upload/test-key/info').expect(401);
      await request(app).get('/api/upload/test-key/signed-url').expect(401);
    });

    it('should work with different user roles', async () => {
      const consumer = await createTestUser('consumer-upload@example.com', 'password123', 'consumer');
      const admin = await createTestUser('admin-upload@example.com', 'password123', 'admin');

      // Test consumer upload
      const consumerResponse = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(consumer.token))
        .attach('file', Buffer.from('fake image data'), 'consumer-image.jpg')
        .expect(200);

      expect(consumerResponse.body.message).toBe('File uploaded successfully');

      // Test admin upload
      const adminResponse = await request(app)
        .post('/api/upload/single')
        .set(getAuthHeader(admin.token))
        .attach('file', Buffer.from('fake image data'), 'admin-image.jpg')
        .expect(200);

      expect(adminResponse.body.message).toBe('File uploaded successfully');
    });
  });
});