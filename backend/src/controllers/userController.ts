import { Request, Response } from 'express';
import { User, Post, Subscription } from '../models';
import { hashPassword, comparePassword } from '../utils/auth';
import { AuthRequest } from '../types';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          as: 'posts',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscribersCount = await Subscription.count({
      where: { userId, status: 'active' }
    });

    const subscriptionsCount = await Subscription.count({
      where: { subscriberId: userId, status: 'active' }
    });

    res.json({
      user,
      stats: {
        subscribersCount,
        subscriptionsCount,
        postsCount: user.posts?.length || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          as: 'posts',
          where: { isPublic: true },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscribersCount = await Subscription.count({
      where: { userId, status: 'active' }
    });

    const postsCount = await Post.count({
      where: { userId, isPublic: true }
    });

    res.json({
      user,
      stats: {
        subscribersCount,
        postsCount
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, bio, avatar, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Role validation
    if (role && !['admin', 'creator', 'consumer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, creator, or consumer' });
    }

    // Only allow role changes to creator (upgrade) or same role for non-admins
    if (role && role !== user.role) {
      if (user.role === 'admin') {
        // Admins can change to any role
      } else if (user.role === 'consumer' && role === 'creator') {
        // Consumers can upgrade to creator
      } else {
        return res.status(403).json({ 
          error: 'Invalid role change. Consumers can only upgrade to creator.' 
        });
      }
    }

    await user.update({
      username: username || user.username,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar || user.avatar,
      role: role || user.role
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deactivateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: false });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'creator', 'consumer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (admin, creator, consumer) is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause: any = {};
    if (role && ['admin', 'creator', 'consumer'].includes(String(role))) {
      whereClause.role = role;
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(users.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};