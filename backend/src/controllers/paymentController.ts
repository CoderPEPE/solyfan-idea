import { Request, Response } from 'express';
import { Payment, Subscription, User } from '../models';
import emailService from '../services/emailService';
import { AuthRequest } from '../types';

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId, type, amount, currency, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!type || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Type, amount, and payment method are required' });
    }

    if (!['subscription', 'one_time'].includes(type)) {
      return res.status(400).json({ error: 'Payment type must be subscription or one_time' });
    }

    if (type === 'subscription' && !subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required for subscription payments' });
    }

    let subscription = null;
    if (subscriptionId) {
      subscription = await Subscription.findByPk(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
    }

    const payment = await Payment.create({
      userId: userId!,
      subscriptionId: subscriptionId || null,
      type,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      status: 'pending',
      id: ''
    });

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, status } = req.body;

    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be completed or failed' });
    }

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = status;
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    await payment.save();

    if (status === 'completed') {
      const user = await User.findByPk(payment.userId);
      if (user && payment.transactionId) {
        emailService.sendPaymentSuccessEmail(
          user.email,
          Number(payment.amount),
          payment.currency,
          payment.transactionId
        );
      }

      if (payment.subscriptionId) {
        const subscription = await Subscription.findByPk(payment.subscriptionId, {
          include: [{ model: User, as: 'user' }]
        });
        if (subscription) {
          subscription.status = 'active';
          await subscription.save();

          if (user && subscription.user) {
            emailService.sendSubscriptionEmail(
              user.email,
              subscription.type,
              Number(subscription.amount),
              subscription.user.email
            );
          }
        }
      }
    }

    res.json({
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const payments = await Payment.findAndCountAll({
      where: { userId },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Subscription,
          as: 'subscription',
          required: false
        }
      ]
    });

    res.json({
      payments: payments.rows,
      pagination: {
        total: payments.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(payments.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    payment.status = 'refunded';
    await payment.save();

    if (payment.subscriptionId) {
      const subscription = await Subscription.findByPk(payment.subscriptionId);
      if (subscription) {
        subscription.status = 'cancelled';
        await subscription.save();
      }
    }

    res.json({
      message: 'Payment refunded successfully',
      payment
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};