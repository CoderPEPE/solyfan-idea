import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Post, Comment, Like } from '../../src/models';
import commentRoutes from '../../src/routes/comments';
import likeRoutes from '../../src/routes/likes';
import { createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

describe('Comments and Likes', () => {
  let users: any;
  let post: any;

  beforeEach(async () => {
    users = await createMultipleTestUsers();
    
    // Create a test post
    post = await Post.create({
      userId: users.creator.id,
      title: 'Test Post for Comments',
      content: 'This post will be used for testing comments and likes',
      isPublic: true
    });
  });

  describe('Comments', () => {
    describe('POST /api/comments/posts/:postId', () => {
      it('should create comment successfully', async () => {
        const commentData = {
          content: 'This is a test comment'
        };

        const response = await request(app)
          .post(`/api/comments/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(commentData)
          .expect(201);

        expect(response.body.message).toBe('Comment created successfully');
        expect(response.body.comment.content).toBe(commentData.content);
        expect(response.body.comment.postId).toBe(post.id);
        expect(response.body.comment.user.email).toBe(users.consumer.email);

        // Verify post comment count was incremented
        const updatedPost = await Post.findByPk(post.id);
        expect(updatedPost?.commentsCount).toBe(1);
      });

      it('should reject empty comment content', async () => {
        const commentData = {
          content: ''
        };

        const response = await request(app)
          .post(`/api/comments/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(commentData)
          .expect(400);

        expect(response.body.error).toBe('Comment content is required');
      });

      it('should reject comment with only whitespace', async () => {
        const commentData = {
          content: '   \n\t   '
        };

        const response = await request(app)
          .post(`/api/comments/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(commentData)
          .expect(400);

        expect(response.body.error).toBe('Comment content is required');
      });

      it('should trim comment content', async () => {
        const commentData = {
          content: '  This is a comment with spaces  '
        };

        const response = await request(app)
          .post(`/api/comments/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(commentData)
          .expect(201);

        expect(response.body.comment.content).toBe('This is a comment with spaces');
      });

      it('should return 404 for non-existent post', async () => {
        const commentData = {
          content: 'Comment on non-existent post'
        };

        const response = await request(app)
          .post('/api/comments/posts/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .send(commentData)
          .expect(404);

        expect(response.body.error).toBe('Post not found');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post(`/api/comments/posts/${post.id}`)
          .send({ content: 'Unauthorized comment' })
          .expect(401);
      });
    });

    describe('GET /api/comments/posts/:postId', () => {
      beforeEach(async () => {
        // Create test comments
        await Comment.create({
          postId: post.id,
          userId: users.consumer.id,
          content: 'First comment'
        });

        await Comment.create({
          postId: post.id,
          userId: users.creator.id,
          content: 'Second comment'
        });
      });

      it('should get comments for post', async () => {
        const response = await request(app)
          .get(`/api/comments/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.comments).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(Array.isArray(response.body.comments)).toBe(true);
        expect(response.body.comments.length).toBe(2);
        
        // Check that comments include user information
        expect(response.body.comments[0].user).toBeDefined();
        expect(response.body.comments[0].user.email).toBeDefined();
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get(`/api/comments/posts/${post.id}?page=1&limit=1`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(1);
        expect(response.body.comments.length).toBe(1);
      });

      it('should return 404 for non-existent post', async () => {
        const response = await request(app)
          .get('/api/comments/posts/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .expect(404);

        expect(response.body.error).toBe('Post not found');
      });

      it('should return empty array for post with no comments', async () => {
        const newPost = await Post.create({
          userId: users.creator.id,
          title: 'Post without comments',
          content: 'No comments here',
          isPublic: true
        });

        const response = await request(app)
          .get(`/api/comments/posts/${newPost.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.comments).toEqual([]);
      });
    });

    describe('PUT /api/comments/:commentId', () => {
      let comment: any;

      beforeEach(async () => {
        comment = await Comment.create({
          postId: post.id,
          userId: users.consumer.id,
          content: 'Original comment content'
        });
      });

      it('should update own comment successfully', async () => {
        const updateData = {
          content: 'Updated comment content'
        };

        const response = await request(app)
          .put(`/api/comments/${comment.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(updateData)
          .expect(200);

        expect(response.body.message).toBe('Comment updated successfully');
        expect(response.body.comment.content).toBe(updateData.content);
      });

      it('should deny updating other user comment', async () => {
        const updateData = {
          content: 'Trying to edit someone else comment'
        };

        const response = await request(app)
          .put(`/api/comments/${comment.id}`)
          .set(getAuthHeader(users.creator.token))
          .send(updateData)
          .expect(403);

        expect(response.body.error).toBe('Access denied. You can only edit your own comments.');
      });

      it('should reject empty content', async () => {
        const updateData = {
          content: ''
        };

        const response = await request(app)
          .put(`/api/comments/${comment.id}`)
          .set(getAuthHeader(users.consumer.token))
          .send(updateData)
          .expect(400);

        expect(response.body.error).toBe('Comment content is required');
      });

      it('should return 404 for non-existent comment', async () => {
        const response = await request(app)
          .put('/api/comments/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .send({ content: 'Updated content' })
          .expect(404);

        expect(response.body.error).toBe('Comment not found');
      });
    });

    describe('DELETE /api/comments/:commentId', () => {
      let comment: any;

      beforeEach(async () => {
        comment = await Comment.create({
          postId: post.id,
          userId: users.consumer.id,
          content: 'Comment to be deleted'
        });

        // Update post comment count
        await Post.increment('commentsCount', { where: { id: post.id } });
      });

      it('should delete own comment successfully', async () => {
        const response = await request(app)
          .delete(`/api/comments/${comment.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.message).toBe('Comment deleted successfully');

        // Verify comment is deleted
        const deletedComment = await Comment.findByPk(comment.id);
        expect(deletedComment).toBeNull();

        // Verify post comment count was decremented
        const updatedPost = await Post.findByPk(post.id);
        expect(updatedPost?.commentsCount).toBe(0);
      });

      it('should deny deleting other user comment', async () => {
        const response = await request(app)
          .delete(`/api/comments/${comment.id}`)
          .set(getAuthHeader(users.creator.token))
          .expect(403);

        expect(response.body.error).toBe('Access denied. You can only delete your own comments.');
      });

      it('should return 404 for non-existent comment', async () => {
        const response = await request(app)
          .delete('/api/comments/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .expect(404);

        expect(response.body.error).toBe('Comment not found');
      });
    });
  });

  describe('Likes', () => {
    describe('POST /api/likes/posts/:postId', () => {
      it('should like post successfully', async () => {
        const response = await request(app)
          .post(`/api/likes/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.message).toBe('Post liked successfully');
        expect(response.body.isLiked).toBe(true);
        expect(response.body.likesCount).toBe(1);

        // Verify like was created
        const like = await Like.findOne({
          where: { postId: post.id, userId: users.consumer.id }
        });
        expect(like).toBeTruthy();

        // Verify post likes count was incremented
        const updatedPost = await Post.findByPk(post.id);
        expect(updatedPost?.likesCount).toBe(1);
      });

      it('should unlike post successfully', async () => {
        // First like the post
        await Like.create({
          postId: post.id,
          userId: users.consumer.id
        });
        await Post.increment('likesCount', { where: { id: post.id } });

        const response = await request(app)
          .post(`/api/likes/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.message).toBe('Post unliked successfully');
        expect(response.body.isLiked).toBe(false);
        expect(response.body.likesCount).toBe(0);

        // Verify like was deleted
        const like = await Like.findOne({
          where: { postId: post.id, userId: users.consumer.id }
        });
        expect(like).toBeNull();

        // Verify post likes count was decremented
        const updatedPost = await Post.findByPk(post.id);
        expect(updatedPost?.likesCount).toBe(0);
      });

      it('should return 404 for non-existent post', async () => {
        const response = await request(app)
          .post('/api/likes/posts/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .expect(404);

        expect(response.body.error).toBe('Post not found');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post(`/api/likes/posts/${post.id}`)
          .expect(401);
      });
    });

    describe('GET /api/likes/posts/:postId', () => {
      beforeEach(async () => {
        // Create test likes
        await Like.create({
          postId: post.id,
          userId: users.consumer.id
        });

        await Like.create({
          postId: post.id,
          userId: users.creator.id
        });
      });

      it('should get post likes', async () => {
        const response = await request(app)
          .get(`/api/likes/posts/${post.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.likes).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(Array.isArray(response.body.likes)).toBe(true);
        expect(response.body.likes.length).toBe(2);
        
        // Check that likes include user information
        expect(response.body.likes[0].user).toBeDefined();
        expect(response.body.likes[0].user.email).toBeDefined();
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get(`/api/likes/posts/${post.id}?page=1&limit=1`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(1);
        expect(response.body.likes.length).toBe(1);
      });

      it('should return 404 for non-existent post', async () => {
        const response = await request(app)
          .get('/api/likes/posts/non-existent-id')
          .set(getAuthHeader(users.consumer.token))
          .expect(404);

        expect(response.body.error).toBe('Post not found');
      });

      it('should return empty array for post with no likes', async () => {
        const newPost = await Post.create({
          userId: users.creator.id,
          title: 'Post without likes',
          content: 'No likes here',
          isPublic: true
        });

        const response = await request(app)
          .get(`/api/likes/posts/${newPost.id}`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.likes).toEqual([]);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple comments and likes on same post', async () => {
      // Add comments
      await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .send({ content: 'First comment' })
        .expect(201);

      await request(app)
        .post(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.creator.token))
        .send({ content: 'Second comment' })
        .expect(201);

      // Add likes
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      // Verify final counts
      const updatedPost = await Post.findByPk(post.id);
      expect(updatedPost?.commentsCount).toBe(2);
      expect(updatedPost?.likesCount).toBe(2);

      // Get comments
      const commentsResponse = await request(app)
        .get(`/api/comments/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(commentsResponse.body.comments.length).toBe(2);

      // Get likes
      const likesResponse = await request(app)
        .get(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(likesResponse.body.likes.length).toBe(2);
    });

    it('should prevent duplicate likes from same user', async () => {
      // Like the post twice
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      // Second like should unlike
      await request(app)
        .post(`/api/likes/posts/${post.id}`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      // Verify no likes remain
      const likes = await Like.findAll({
        where: { postId: post.id, userId: users.consumer.id }
      });
      expect(likes.length).toBe(0);
    });
  });
});