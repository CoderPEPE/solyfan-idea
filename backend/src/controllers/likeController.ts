import { Request, Response } from 'express';
import { Like, Post, User } from '../models';
import { AuthRequest } from '../types';

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingLike = await Like.findOne({
      where: {
        postId,
        userId: userId!
      }
    });

    if (existingLike) {
      await existingLike.destroy();
      await Post.decrement('likesCount', { where: { id: postId } });
      
      res.json({
        message: 'Post unliked successfully',
        isLiked: false,
        likesCount: post.likesCount - 1
      });
    } else {
      await Like.create({
        postId,
        userId: userId!
      });
      await Post.increment('likesCount', { where: { id: postId } });
      
      res.json({
        message: 'Post liked successfully',
        isLiked: true,
        likesCount: post.likesCount + 1
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likes = await Like.findAndCountAll({
      where: { postId },
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
      likes: likes.rows,
      pagination: {
        total: likes.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(likes.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};