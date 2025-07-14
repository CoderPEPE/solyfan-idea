import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { authenticate } from '../../src/middleware/auth';
import { requireAdmin, requireCreator, requireCreatorToPost } from '../../src/middleware/roleAuth';
import { createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());

// Test routes for role authorization
app.get('/test/admin', authenticate, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

app.get('/test/creator', authenticate, requireCreator, (req, res) => {
  res.json({ message: 'Creator access granted' });
});

app.post('/test/create-post', authenticate, requireCreatorToPost, (req, res) => {
  res.json({ message: 'Post creation allowed' });
});

describe('Role-Based Authorization', () => {
  let users: any;

  beforeEach(async () => {
    users = await createMultipleTestUsers();
  });

  describe('Admin Access Control', () => {
    it('should allow admin access to admin-only route', async () => {
      const response = await request(app)
        .get('/test/admin')
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      expect(response.body.message).toBe('Admin access granted');
    });

    it('should deny creator access to admin-only route', async () => {
      const response = await request(app)
        .get('/test/admin')
        .set(getAuthHeader(users.creator.token))
        .expect(403);

      expect(response.body.error).toContain('Access denied');
      expect(response.body.error).toContain('Required role: admin');
      expect(response.body.error).toContain('Current role: creator');
    });

    it('should deny consumer access to admin-only route', async () => {
      const response = await request(app)
        .get('/test/admin')
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      expect(response.body.error).toContain('Access denied');
      expect(response.body.error).toContain('Required role: admin');
      expect(response.body.error).toContain('Current role: consumer');
    });

    it('should deny unauthenticated access to admin-only route', async () => {
      const response = await request(app)
        .get('/test/admin')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Creator Access Control', () => {
    it('should allow admin access to creator route', async () => {
      const response = await request(app)
        .get('/test/creator')
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      expect(response.body.message).toBe('Creator access granted');
    });

    it('should allow creator access to creator route', async () => {
      const response = await request(app)
        .get('/test/creator')
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(response.body.message).toBe('Creator access granted');
    });

    it('should deny consumer access to creator route', async () => {
      const response = await request(app)
        .get('/test/creator')
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      expect(response.body.error).toContain('Access denied');
      expect(response.body.error).toContain('Required role: creator or admin');
      expect(response.body.error).toContain('Current role: consumer');
    });
  });

  describe('Post Creation Access Control', () => {
    it('should allow admin to create posts', async () => {
      const response = await request(app)
        .post('/test/create-post')
        .set(getAuthHeader(users.admin.token))
        .send({ title: 'Test Post' })
        .expect(200);

      expect(response.body.message).toBe('Post creation allowed');
    });

    it('should allow creator to create posts', async () => {
      const response = await request(app)
        .post('/test/create-post')
        .set(getAuthHeader(users.creator.token))
        .send({ title: 'Test Post' })
        .expect(200);

      expect(response.body.message).toBe('Post creation allowed');
    });

    it('should deny consumer from creating posts', async () => {
      const response = await request(app)
        .post('/test/create-post')
        .set(getAuthHeader(users.consumer.token))
        .send({ title: 'Test Post' })
        .expect(403);

      expect(response.body.error).toBe(
        'Only creators and admins can create posts. Please upgrade your account to creator status.'
      );
    });

    it('should deny unauthenticated post creation', async () => {
      const response = await request(app)
        .post('/test/create-post')
        .send({ title: 'Test Post' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Authentication Required for Role Checks', () => {
    it('should require authentication before role check', async () => {
      const response = await request(app)
        .get('/test/creator')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should handle invalid tokens in role middleware', async () => {
      const response = await request(app)
        .get('/test/creator')
        .set({ Authorization: 'Bearer invalid-token' })
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Role Middleware Error Handling', () => {
    it('should handle missing user in request', async () => {
      // Create a custom route that bypasses authentication but uses role middleware
      const testApp = express();
      testApp.use(express.json());
      testApp.get('/test/no-auth', requireAdmin, (req, res) => {
        res.json({ message: 'Should not reach here' });
      });

      const response = await request(testApp)
        .get('/test/no-auth')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});