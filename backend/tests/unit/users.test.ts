import request from 'supertest';
import express from 'express';
import cors from 'cors';
import userRoutes from '../../src/routes/users';
import { authenticate } from '../../src/middleware/auth';
import { createTestUser, createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Management', () => {
  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      const user = await createTestUser('profile@example.com', 'password123', 'creator');

      const response = await request(app)
        .get('/api/users/profile')
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.role).toBe('creator');
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.stats).toBeDefined();
    });

    it('should reject unauthorized request', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set({ Authorization: 'Bearer invalid-token' })
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should get public user profile', async () => {
      const user = await createTestUser('public@example.com', 'password123', 'creator');

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.role).toBe('creator');
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.stats).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile successfully', async () => {
      const user = await createTestUser('update@example.com', 'password123', 'consumer');

      const updateData = {
        username: 'newusername',
        bio: 'Updated bio',
        avatar: 'new-avatar-url.jpg'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user.token))
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.username).toBe(updateData.username);
      expect(response.body.user.bio).toBe(updateData.bio);
      expect(response.body.user.avatar).toBe(updateData.avatar);
    });

    it('should upgrade consumer to creator', async () => {
      const user = await createTestUser('upgrade@example.com', 'password123', 'consumer');

      const updateData = {
        role: 'creator'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user.token))
        .send(updateData)
        .expect(200);

      expect(response.body.user.role).toBe('creator');
    });

    it('should reject invalid role change', async () => {
      const user = await createTestUser('invalid@example.com', 'password123', 'creator');

      const updateData = {
        role: 'consumer' // Creator trying to downgrade
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user.token))
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Invalid role change. Consumers can only upgrade to creator.');
    });

    it('should reject duplicate username', async () => {
      const user1 = await createTestUser('user1@example.com', 'password123', 'consumer');
      const user2 = await createTestUser('user2@example.com', 'password123', 'consumer');

      // Set username for user1
      await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user1.token))
        .send({ username: 'uniqueusername' })
        .expect(200);

      // Try to set same username for user2
      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user2.token))
        .send({ username: 'uniqueusername' })
        .expect(409);

      expect(response.body.error).toBe('Username already taken');
    });

    it('should reject invalid role value', async () => {
      const user = await createTestUser('invalid-role@example.com', 'password123', 'consumer');

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(user.token))
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.error).toBe('Role must be admin, creator, or consumer');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createTestUser('password@example.com', 'oldpassword', 'consumer');

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeader(user.token))
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should reject incorrect current password', async () => {
      const user = await createTestUser('wrongpass@example.com', 'correctpass', 'consumer');

      const passwordData = {
        currentPassword: 'wrongpass',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeader(user.token))
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('Current password is incorrect');
    });

    it('should reject short new password', async () => {
      const user = await createTestUser('shortpass@example.com', 'oldpassword', 'consumer');

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: '123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeader(user.token))
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('New password must be at least 6 characters long');
    });

    it('should require both current and new password', async () => {
      const user = await createTestUser('missing@example.com', 'password123', 'consumer');

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeader(user.token))
        .send({ currentPassword: 'password123' })
        .expect(400);

      expect(response.body.error).toBe('Current password and new password are required');
    });
  });

  describe('PATCH /api/users/deactivate', () => {
    it('should deactivate account successfully', async () => {
      const user = await createTestUser('deactivate@example.com', 'password123', 'consumer');

      const response = await request(app)
        .patch('/api/users/deactivate')
        .set(getAuthHeader(user.token))
        .expect(200);

      expect(response.body.message).toBe('Account deactivated successfully');
    });
  });

  describe('Admin Operations', () => {
    describe('GET /api/users/all', () => {
      it('should allow admin to get all users', async () => {
        const { admin } = await createMultipleTestUsers();

        const response = await request(app)
          .get('/api/users/all')
          .set(getAuthHeader(admin.token))
          .expect(200);

        expect(response.body.users).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(Array.isArray(response.body.users)).toBe(true);
      });

      it('should reject non-admin access', async () => {
        const { creator } = await createMultipleTestUsers();

        const response = await request(app)
          .get('/api/users/all')
          .set(getAuthHeader(creator.token))
          .expect(403);

        expect(response.body.error).toContain('Access denied');
      });

      it('should filter users by role', async () => {
        const { admin } = await createMultipleTestUsers();

        const response = await request(app)
          .get('/api/users/all?role=creator')
          .set(getAuthHeader(admin.token))
          .expect(200);

        expect(response.body.users.every((user: any) => user.role === 'creator')).toBe(true);
      });
    });

    describe('PATCH /api/users/:userId/role', () => {
      it('should allow admin to update user role', async () => {
        const { admin, consumer } = await createMultipleTestUsers();

        const response = await request(app)
          .patch(`/api/users/${consumer.id}/role`)
          .set(getAuthHeader(admin.token))
          .send({ role: 'creator' })
          .expect(200);

        expect(response.body.message).toBe('User role updated successfully');
        expect(response.body.user.role).toBe('creator');
      });

      it('should reject non-admin role updates', async () => {
        const { creator, consumer } = await createMultipleTestUsers();

        const response = await request(app)
          .patch(`/api/users/${consumer.id}/role`)
          .set(getAuthHeader(creator.token))
          .send({ role: 'admin' })
          .expect(403);

        expect(response.body.error).toContain('Access denied');
      });

      it('should reject invalid role', async () => {
        const { admin, consumer } = await createMultipleTestUsers();

        const response = await request(app)
          .patch(`/api/users/${consumer.id}/role`)
          .set(getAuthHeader(admin.token))
          .send({ role: 'invalid' })
          .expect(400);

        expect(response.body.error).toBe('Valid role (admin, creator, consumer) is required');
      });

      it('should return 404 for non-existent user', async () => {
        const { admin } = await createMultipleTestUsers();

        const response = await request(app)
          .patch('/api/users/non-existent-id/role')
          .set(getAuthHeader(admin.token))
          .send({ role: 'creator' })
          .expect(404);

        expect(response.body.error).toBe('User not found');
      });
    });
  });
});