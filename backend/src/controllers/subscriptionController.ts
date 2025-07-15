import { Request, Response } from 'express';
import { Subscription, User } from '../models';
import { AuthRequest } from '../types';

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, amount } = req.body;
    const subscriberId = req.user?.id;

    if (!userId || !type || !amount) {
      return res.status(400).json({ error: 'User ID, subscription type, and amount are required' });
    }

    if (!['monthly', 'annual'].includes(type)) {
      return res.status(400).json({ error: 'Subscription type must be monthly or annual' });
    }

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userId === subscriberId) {
      return res.status(400).json({ error: 'Cannot subscribe to yourself' });
    }

    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        subscriberId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      return res.status(409).json({ error: 'Active subscription already exists' });
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await Subscription.create({
      userId,
      subscriberId: subscriberId!,
      type,
      amount,
      startDate,
      endDate,
      id: '',
      status: 'active'
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const subscriberId = req.user?.id;

    const subscriptions = await Subscription.findAll({
      where: { subscriberId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'avatar']
        }
      ]
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySubscribers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const subscriptions = await Subscription.findAll({
      where: { userId, status: 'active' },
      include: [
        {
          model: User,
          as: 'subscriber',
          attributes: ['id', 'email', 'username', 'avatar']
        }
      ]
    });

    res.json({ subscribers: subscriptions });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const subscriberId = req.user?.id;

    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        subscriberId,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Active subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};