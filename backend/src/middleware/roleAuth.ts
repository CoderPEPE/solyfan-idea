import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models';

export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Current role: ${user.role}` 
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireCreator = requireRole(['creator', 'admin']);
export const requireCreatorOrConsumer = requireRole(['creator', 'consumer', 'admin']);

export const requireCreatorToPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role === 'consumer') {
      return res.status(403).json({ 
        error: 'Only creators and admins can create posts. Please upgrade your account to creator status.' 
      });
    }

    next();
  } catch (error) {
    console.error('Creator authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};