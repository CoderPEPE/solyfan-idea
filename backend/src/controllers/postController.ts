import { Request, Response } from 'express';
import { Post, User, Comment, Like, Subscription } from '../models';
import { Op } from 'sequelize';
import { AuthRequest } from '../types';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, mediaUrls, mediaTypes, isPublic } = req.body;
    const userId = req.user?.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const post = await Post.create({
      userId: userId!,
      title,
      content: content || '',
      mediaUrls: mediaUrls || [],
      mediaTypes: mediaTypes || [],
      isPublic: isPublic || false,
      id: '',
      likesCount: 0,
      commentsCount: 0
    });

    const postWithUser = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithUser
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, userId: authorId } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let whereClause: any = {};

    if (authorId) {
      whereClause.userId = String(authorId);
      
      if (String(authorId) !== userId) {
        const subscription = await Subscription.findOne({
          where: {
            userId: String(authorId),
            subscriberId: userId,
            status: 'active'
          }
        });

        if (!subscription) {
          whereClause.isPublic = true;
        }
      }
    } else {
      const subscriptions = await Subscription.findAll({
        where: {
          subscriberId: userId,
          status: 'active'
        },
        attributes: ['userId']
      });

      const subscribedUserIds = subscriptions.map(sub => sub.userId);
      subscribedUserIds.push(userId!);

      whereClause = {
        [Op.or]: [
          { userId: { [Op.in]: subscribedUserIds } },
          { isPublic: true }
        ]
      };
    }

    const posts = await Post.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'avatar']
        }
      ]
    });

    res.json({
      posts: posts.rows,
      pagination: {
        total: posts.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(posts.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'username', 'avatar']
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.isPublic && post.userId !== userId) {
      const subscription = await Subscription.findOne({
        where: {
          userId: post.userId,
          subscriberId: userId,
          status: 'active'
        }
      });

      if (!subscription) {
        return res.status(403).json({ error: 'Access denied. Subscription required.' });
      }
    }

    const userLike = await Like.findOne({
      where: {
        postId: post.id,
        userId: userId
      }
    });

    res.json({
      post,
      isLiked: !!userLike
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content, mediaUrls, mediaTypes, isPublic } = req.body;
    const userId = req.user?.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own posts.' });
    }

    await post.update({
      title: title || post.title,
      content: content !== undefined ? content : post.content,
      mediaUrls: mediaUrls || post.mediaUrls,
      mediaTypes: mediaTypes || post.mediaTypes,
      isPublic: isPublic !== undefined ? isPublic : post.isPublic
    });

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own posts.' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};