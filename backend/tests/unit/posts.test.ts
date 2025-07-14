import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Post, Subscription } from '../../src/models';
import postRoutes from '../../src/routes/posts';
import { createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/posts', postRoutes);

describe('Post Management', () => {
  let users: any;

  beforeEach(async () => {
    users = await createMultipleTestUsers();
  });

  describe('POST /api/posts', () => {
    it('should allow creator to create a post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        mediaUrls: ['https://example.com/image.jpg'],
        mediaTypes: ['image/jpeg'],
        isPublic: true
      };

      const response = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.creator.token))
        .send(postData)
        .expect(201);

      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.post.title).toBe(postData.title);
      expect(response.body.post.content).toBe(postData.content);
      expect(response.body.post.isPublic).toBe(true);
      expect(response.body.post.user.email).toBe(users.creator.email);
    });

    it('should allow admin to create a post', async () => {
      const postData = {
        title: 'Admin Post',
        content: 'Admin created post'
      };

      const response = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.admin.token))
        .send(postData)
        .expect(201);

      expect(response.body.post.title).toBe(postData.title);
    });

    it('should reject consumer from creating posts', async () => {
      const postData = {
        title: 'Consumer Post',
        content: 'This should fail'
      };

      const response = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.consumer.token))
        .send(postData)
        .expect(403);

      expect(response.body.error).toBe(
        'Only creators and admins can create posts. Please upgrade your account to creator status.'
      );
    });

    it('should reject post creation without title', async () => {
      const postData = {
        content: 'Post without title'
      };

      const response = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.creator.token))
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('Title is required');
    });

    it('should create post with default values', async () => {
      const postData = {
        title: 'Minimal Post'
      };

      const response = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.creator.token))
        .send(postData)
        .expect(201);

      expect(response.body.post.content).toBe('');
      expect(response.body.post.mediaUrls).toEqual([]);
      expect(response.body.post.mediaTypes).toEqual([]);
      expect(response.body.post.isPublic).toBe(false);
      expect(response.body.post.likesCount).toBe(0);
      expect(response.body.post.commentsCount).toBe(0);
    });
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      // Create test posts
      await Post.create({
        userId: users.creator.id,
        title: 'Public Post',
        content: 'This is public',
        isPublic: true
      });

      await Post.create({
        userId: users.creator.id,
        title: 'Private Post',
        content: 'This is private',
        isPublic: false
      });
    });

    it('should get public posts for any user', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.posts).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.posts.length).toBeGreaterThan(0);
      
      // Should only see public posts or posts from subscribed creators
      const publicPosts = response.body.posts.filter((post: any) => post.isPublic);
      expect(publicPosts.length).toBeGreaterThan(0);
    });

    it('should get all posts for creator (own posts)', async () => {
      const response = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(response.body.posts.length).toBe(2); // Both public and private
    });

    it('should only show public posts for non-subscribers', async () => {
      const response = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.posts.length).toBe(1); // Only public post
      expect(response.body.posts[0].isPublic).toBe(true);
    });

    it('should show all posts for subscribers', async () => {
      // Create subscription
      await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 10.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.posts.length).toBe(2); // Both public and private
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=1')
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBeDefined();
      expect(response.body.pagination.totalPages).toBeDefined();
    });
  });

  describe('GET /api/posts/:postId', () => {
    let publicPost: any;
    let privatePost: any;

    beforeEach(async () => {
      publicPost = await Post.create({
        userId: users.creator.id,
        title: 'Public Post',
        content: 'This is public',
        isPublic: true
      });

      privatePost = await Post.create({
        userId: users.creator.id,
        title: 'Private Post',
        content: 'This is private',
        isPublic: false
      });
    });

    it('should get public post for any user', async () => {
      const response = await request(app)
        .get(`/api/posts/${publicPost.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.post.title).toBe('Public Post');
      expect(response.body.post.user).toBeDefined();
      expect(response.body.post.comments).toBeDefined();
      expect(response.body.isLiked).toBeDefined();
    });

    it('should deny access to private post for non-subscribers', async () => {
      const response = await request(app)
        .get(`/api/posts/${privatePost.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      expect(response.body.error).toBe('Access denied. Subscription required.');
    });

    it('should allow creator to access own private posts', async () => {
      const response = await request(app)
        .get(`/api/posts/${privatePost.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(response.body.post.title).toBe('Private Post');
    });

    it('should allow subscribers to access private posts', async () => {
      // Create subscription
      await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 10.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/posts/${privatePost.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.post.title).toBe('Private Post');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/non-existent-id')
        .set(getAuthHeader(users.consumer.token))
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('PUT /api/posts/:postId', () => {
    let post: any;

    beforeEach(async () => {
      post = await Post.create({
        userId: users.creator.id,
        title: 'Original Title',
        content: 'Original content',
        isPublic: false
      });
    });

    it('should allow creator to update own post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        isPublic: true
      };

      const response = await request(app)
        .put(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Post updated successfully');
      expect(response.body.post.title).toBe(updateData.title);
      expect(response.body.post.content).toBe(updateData.content);
      expect(response.body.post.isPublic).toBe(true);
    });

    it('should deny other users from updating post', async () => {
      const updateData = {
        title: 'Hacked Title'
      };

      const response = await request(app)
        .put(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied. You can only edit your own posts.');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .put('/api/posts/non-existent-id')
        .set(getAuthHeader(users.creator.token))
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('DELETE /api/posts/:postId', () => {
    let post: any;

    beforeEach(async () => {
      post = await Post.create({
        userId: users.creator.id,
        title: 'Post to Delete',
        content: 'This will be deleted'
      });
    });

    it('should allow creator to delete own post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(response.body.message).toBe('Post deleted successfully');

      // Verify post is deleted
      const deletedPost = await Post.findByPk(post.id);
      expect(deletedPost).toBeNull();
    });

    it('should deny other users from deleting post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      expect(response.body.error).toBe('Access denied. You can only delete your own posts.');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .delete('/api/posts/non-existent-id')
        .set(getAuthHeader(users.creator.token))
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('Authentication Required', () => {
    it('should require authentication for all post operations', async () => {
      // Test each endpoint without auth token
      await request(app).post('/api/posts').send({ title: 'Test' }).expect(401);
      await request(app).get('/api/posts').expect(401);
      await request(app).get('/api/posts/some-id').expect(401);
      await request(app).put('/api/posts/some-id').send({ title: 'Test' }).expect(401);
      await request(app).delete('/api/posts/some-id').expect(401);
    });
  });
});