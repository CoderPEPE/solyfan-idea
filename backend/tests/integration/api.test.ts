import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from '../../src/routes/auth';
import userRoutes from '../../src/routes/users';
import postRoutes from '../../src/routes/posts';
import commentRoutes from '../../src/routes/comments';
import likeRoutes from '../../src/routes/likes';
import subscriptionRoutes from '../../src/routes/subscriptions';
import paymentRoutes from '../../src/routes/payments';

import { createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';
import { Post, Subscription } from '../../src/models';

// Create test app similar to main app
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Higher limit for tests
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

describe('API Integration Tests', () => {
  let users: any;

  beforeEach(async () => {
    users = await createMultipleTestUsers();
  });

  describe('End-to-End User Journey', () => {
    it('should complete full user journey: register → upgrade → create post → subscribe → interact', async () => {
      // 1. Register new consumer
      const registrationData = {
        email: 'journey@example.com',
        password: 'password123',
        role: 'consumer'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      expect(registerResponse.body.user.role).toBe('consumer');
      const newUserToken = registerResponse.body.token;

      // 2. Upgrade to creator
      const upgradeResponse = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeader(newUserToken))
        .send({ role: 'creator' })
        .expect(200);

      expect(upgradeResponse.body.user.role).toBe('creator');

      // 3. Create a post as creator
      const postData = {
        title: 'My First Creator Post',
        content: 'Welcome to my content!',
        isPublic: false // Private post
      };

      const postResponse = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(newUserToken))
        .send(postData)
        .expect(201);

      const postId = postResponse.body.post.id;

      // 4. Consumer tries to view private post (should fail)
      await request(app)
        .get(`/api/posts/${postId}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      // 5. Consumer subscribes to creator
      const subscriptionData = {
        userId: upgradeResponse.body.user.id,
        type: 'monthly',
        amount: 9.99
      };

      const subscriptionResponse = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(201);

      expect(subscriptionResponse.body.subscription.status).toBe('active');

      // 6. Consumer can now view private post
      const privatePostResponse = await request(app)
        .get(`/api/posts/${postId}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(privatePostResponse.body.post.title).toBe(postData.title);

      // 7. Consumer likes the post
      const likeResponse = await request(app)
        .post(`/api/likes/posts/${postId}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(likeResponse.body.isLiked).toBe(true);

      // 8. Consumer comments on the post
      const commentResponse = await request(app)
        .post(`/api/comments/posts/${postId}`)
        .set(getAuthHeader(users.consumer.token))
        .send({ content: 'Great content!' })
        .expect(201);

      expect(commentResponse.body.comment.content).toBe('Great content!');

      // 9. Creator checks their subscribers
      const subscribersResponse = await request(app)
        .get('/api/subscriptions/my-subscribers')
        .set(getAuthHeader(newUserToken))
        .expect(200);

      expect(subscribersResponse.body.subscribers.length).toBe(1);
      expect(subscribersResponse.body.subscribers[0].subscriber.email).toBe(users.consumer.email);
    });

    it('should handle content creator workflow', async () => {
      // 1. Creator creates multiple posts
      const posts = [];
      for (let i = 0; i < 3; i++) {
        const postResponse = await request(app)
          .post('/api/posts')
          .set(getAuthHeader(users.creator.token))
          .send({
            title: `Post ${i + 1}`,
            content: `Content for post ${i + 1}`,
            isPublic: i === 0 // First post public, others private
          })
          .expect(201);
        
        posts.push(postResponse.body.post);
      }

      // 2. Get creator's posts
      const creatorPostsResponse = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(creatorPostsResponse.body.posts.length).toBe(3);

      // 3. Non-subscriber sees only public posts
      const publicPostsResponse = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(publicPostsResponse.body.posts.length).toBe(1);
      expect(publicPostsResponse.body.posts[0].isPublic).toBe(true);

      // 4. Create subscription
      await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send({
          userId: users.creator.id,
          type: 'monthly',
          amount: 19.99
        })
        .expect(201);

      // 5. Subscriber now sees all posts
      const subscriberPostsResponse = await request(app)
        .get(`/api/posts?userId=${users.creator.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(subscriberPostsResponse.body.posts.length).toBe(3);
    });
  });

  describe('Admin Management Workflow', () => {
    it('should allow admin to manage users and content', async () => {
      // 1. Admin views all users
      const allUsersResponse = await request(app)
        .get('/api/users/all')
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      expect(allUsersResponse.body.users.length).toBeGreaterThanOrEqual(3);

      // 2. Admin promotes consumer to creator
      const promoteResponse = await request(app)
        .patch(`/api/users/${users.consumer.id}/role`)
        .set(getAuthHeader(users.admin.token))
        .send({ role: 'creator' })
        .expect(200);

      expect(promoteResponse.body.user.role).toBe('creator');

      // 3. Newly promoted creator can now create posts
      const newCreatorPostResponse = await request(app)
        .post('/api/posts')
        .set(getAuthHeader(users.consumer.token))
        .send({
          title: 'My First Post as Creator',
          content: 'Just got promoted!'
        })
        .expect(201);

      expect(newCreatorPostResponse.body.post.title).toBe('My First Post as Creator');

      // 4. Admin views users by role
      const creatorsResponse = await request(app)
        .get('/api/users/all?role=creator')
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      expect(creatorsResponse.body.users.length).toBeGreaterThanOrEqual(2);
      expect(creatorsResponse.body.users.every((user: any) => user.role === 'creator')).toBe(true);
    });

    it('should prevent non-admin from accessing admin features', async () => {
      // Creator tries to access admin endpoints
      await request(app)
        .get('/api/users/all')
        .set(getAuthHeader(users.creator.token))
        .expect(403);

      await request(app)
        .patch(`/api/users/${users.consumer.id}/role`)
        .set(getAuthHeader(users.creator.token))
        .send({ role: 'admin' })
        .expect(403);

      // Consumer tries to access admin endpoints
      await request(app)
        .get('/api/users/all')
        .set(getAuthHeader(users.consumer.token))
        .expect(403);

      await request(app)
        .patch(`/api/users/${users.creator.id}/role`)
        .set(getAuthHeader(users.consumer.token))
        .send({ role: 'admin' })
        .expect(403);
    });
  });

  describe('Payment and Subscription Integration', () => {
    it('should handle complete payment flow', async () => {
      // 1. Create subscription
      const subscriptionResponse = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send({
          userId: users.creator.id,
          type: 'annual',
          amount: 99.99
        })
        .expect(201);

      const subscriptionId = subscriptionResponse.body.subscription.id;

      // 2. Create payment for subscription
      const paymentResponse = await request(app)
        .post('/api/payments')
        .set(getAuthHeader(users.consumer.token))
        .send({
          subscriptionId,
          type: 'subscription',
          amount: 99.99,
          currency: 'USD',
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const paymentId = paymentResponse.body.payment.id;
      expect(paymentResponse.body.payment.status).toBe('pending');

      // 3. Process payment (simulate payment gateway callback)
      const processResponse = await request(app)
        .patch(`/api/payments/${paymentId}/process`)
        .set(getAuthHeader(users.consumer.token))
        .send({
          status: 'completed',
          transactionId: 'txn_test_12345'
        })
        .expect(200);

      expect(processResponse.body.payment.status).toBe('completed');

      // 4. Check subscription is still active
      const subscriptionsResponse = await request(app)
        .get('/api/subscriptions/my-subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(subscriptionsResponse.body.subscriptions.length).toBe(1);
      expect(subscriptionsResponse.body.subscriptions[0].status).toBe('active');

      // 5. Check payment history
      const paymentsResponse = await request(app)
        .get('/api/payments/my-payments')
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(paymentsResponse.body.payments.length).toBe(1);
      expect(paymentsResponse.body.payments[0].status).toBe('completed');
    });

    it('should handle subscription cancellation', async () => {
      // 1. Create and verify subscription
      const subscription = await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 9.99,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });

      // 2. Cancel subscription
      const cancelResponse = await request(app)
        .patch(`/api/subscriptions/${subscription.id}/cancel`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(cancelResponse.body.subscription.status).toBe('cancelled');

      // 3. Verify access to private content is revoked
      const privatePost = await Post.create({
        userId: users.creator.id,
        title: 'Private Post',
        content: 'Subscribers only',
        isPublic: false
      });

      await request(app)
        .get(`/api/posts/${privatePost.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(403);
    });
  });

  describe('Content Interaction Flow', () => {
    let post: any;

    beforeEach(async () => {
      post = await Post.create({
        userId: users.creator.id,
        title: 'Interactive Post',
        content: 'Let\'s interact!',
        isPublic: true
      });
    });

    it('should handle multiple users interacting with content', async () => {
      // Multiple users like the post
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      // Multiple users comment
      await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .send({ content: 'Great post!' })
        .expect(201);

      await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.admin.token))
        .send({ content: 'Excellent content!' })
        .expect(201);

      // Check final counts
      const postResponse = await request(app)
        .get(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(postResponse.body.post.likesCount).toBe(2);
      expect(postResponse.body.post.commentsCount).toBe(2);
      expect(postResponse.body.post.comments.length).toBe(2);
    });

    it('should maintain consistency when users unlike and delete comments', async () => {
      // Like and comment
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      const commentResponse = await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .send({ content: 'Test comment' })
        .expect(201);

      // Unlike
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      // Delete comment
      await request(app)
        .delete(`/api/comments/${commentResponse.body.comment.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      // Check counts are back to zero
      const finalPostResponse = await request(app)
        .get(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(finalPostResponse.body.post.likesCount).toBe(0);
      expect(finalPostResponse.body.post.commentsCount).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle cascading operations correctly', async () => {
      // Create post with interactions
      const post = await Post.create({
        userId: users.creator.id,
        title: 'Post to Delete',
        content: 'This will be deleted',
        isPublic: true
      });

      // Add some interactions
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .send({ content: 'Comment on post to delete' })
        .expect(201);

      // Delete the post
      await request(app)
        .delete(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      // Verify post is gone
      await request(app)
        .get(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .expect(404);
    });

    it('should handle rapid concurrent requests', async () => {
      const post = await Post.create({
        userId: users.creator.id,
        title: 'Concurrent Test Post',
        content: 'For testing concurrency',
        isPublic: true
      });

      // Rapid like/unlike operations
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post(`/api/likes/posts/${post.id}`)
            .set(getAuthHeader(users.consumer.token))
        );
      }

      await Promise.all(promises);

      // Final state should be consistent (liked or not liked, not in-between)
      const finalResponse = await request(app)
        .get(`/api/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect([0, 1]).toContain(finalResponse.body.post.likesCount);
    });
  });
});