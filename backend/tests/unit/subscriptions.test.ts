import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Subscription, Payment } from '../../src/models';
import subscriptionRoutes from '../../src/routes/subscriptions';
import paymentRoutes from '../../src/routes/payments';
import { createMultipleTestUsers, getAuthHeader } from '../utils/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

describe('Subscriptions and Payments', () => {
  let users: any;

  beforeEach(async () => {
    users = await createMultipleTestUsers();
  });

  describe('POST /api/subscriptions', () => {
    it('should create monthly subscription successfully', async () => {
      const subscriptionData = {
        userId: users.creator.id,
        type: 'monthly',
        amount: 9.99
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(201);

      expect(response.body.message).toBe('Subscription created successfully');
      expect(response.body.subscription.type).toBe('monthly');
      expect(response.body.subscription.amount).toBe('9.99');
      expect(response.body.subscription.status).toBe('active');
      expect(response.body.subscription.userId).toBe(users.creator.id);
      expect(response.body.subscription.subscriberId).toBe(users.consumer.id);
    });

    it('should create annual subscription successfully', async () => {
      const subscriptionData = {
        userId: users.creator.id,
        type: 'annual',
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(201);

      expect(response.body.subscription.type).toBe('annual');
      expect(response.body.subscription.amount).toBe('99.99');
    });

    it('should reject subscription to self', async () => {
      const subscriptionData = {
        userId: users.consumer.id, // Same as subscriber
        type: 'monthly',
        amount: 9.99
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(400);

      expect(response.body.error).toBe('Cannot subscribe to yourself');
    });

    it('should reject duplicate active subscription', async () => {
      const subscriptionData = {
        userId: users.creator.id,
        type: 'monthly',
        amount: 9.99
      };

      // Create first subscription
      await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(409);

      expect(response.body.error).toBe('Active subscription already exists');
    });

    it('should reject invalid subscription type', async () => {
      const subscriptionData = {
        userId: users.creator.id,
        type: 'weekly',
        amount: 9.99
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(400);

      expect(response.body.error).toBe('Subscription type must be monthly or annual');
    });

    it('should reject subscription to non-existent user', async () => {
      const subscriptionData = {
        userId: 'non-existent-id',
        type: 'monthly',
        amount: 9.99
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send(subscriptionData)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .send({})
        .expect(400);

      expect(response.body.error).toBe('User ID, subscription type, and amount are required');
    });
  });

  describe('GET /api/subscriptions/my-subscriptions', () => {
    beforeEach(async () => {
      // Create test subscription
      await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 9.99,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should get user subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscriptions')
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.subscriptions).toBeDefined();
      expect(Array.isArray(response.body.subscriptions)).toBe(true);
      expect(response.body.subscriptions.length).toBe(1);
      expect(response.body.subscriptions[0].type).toBe('monthly');
      expect(response.body.subscriptions[0].user).toBeDefined();
    });

    it('should return empty array for user with no subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscriptions')
        .set(getAuthHeader(users.admin.token))
        .expect(200);

      expect(response.body.subscriptions).toEqual([]);
    });
  });

  describe('GET /api/subscriptions/my-subscribers', () => {
    beforeEach(async () => {
      // Create test subscription
      await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 9.99,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should get user subscribers', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscribers')
        .set(getAuthHeader(users.creator.token))
        .expect(200);

      expect(response.body.subscribers).toBeDefined();
      expect(Array.isArray(response.body.subscribers)).toBe(true);
      expect(response.body.subscribers.length).toBe(1);
      expect(response.body.subscribers[0].subscriber).toBeDefined();
    });
  });

  describe('PATCH /api/subscriptions/:subscriptionId/cancel', () => {
    let subscription: any;

    beforeEach(async () => {
      subscription = await Subscription.create({
        userId: users.creator.id,
        subscriberId: users.consumer.id,
        type: 'monthly',
        amount: 9.99,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    });

    it('should cancel subscription successfully', async () => {
      const response = await request(app)
        .patch(`/api/subscriptions/${subscription.id}/cancel`)
        .set(getAuthHeader(users.consumer.token))
        .expect(200);

      expect(response.body.message).toBe('Subscription cancelled successfully');
      expect(response.body.subscription.status).toBe('cancelled');
    });

    it('should not allow cancelling other user subscription', async () => {
      const response = await request(app)
        .patch(`/api/subscriptions/${subscription.id}/cancel`)
        .set(getAuthHeader(users.admin.token))
        .expect(404);

      expect(response.body.error).toBe('Active subscription not found');
    });

    it('should return 404 for non-existent subscription', async () => {
      const response = await request(app)
        .patch('/api/subscriptions/non-existent-id/cancel')
        .set(getAuthHeader(users.consumer.token))
        .expect(404);

      expect(response.body.error).toBe('Active subscription not found');
    });
  });

  describe('Payment Management', () => {
    describe('POST /api/payments', () => {
      let subscription: any;

      beforeEach(async () => {
        subscription = await Subscription.create({
          userId: users.creator.id,
          subscriberId: users.consumer.id,
          type: 'monthly',
          amount: 9.99,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        });
      });

      it('should create subscription payment successfully', async () => {
        const paymentData = {
          subscriptionId: subscription.id,
          type: 'subscription',
          amount: 9.99,
          currency: 'USD',
          paymentMethod: 'credit_card'
        };

        const response = await request(app)
          .post('/api/payments')
          .set(getAuthHeader(users.consumer.token))
          .send(paymentData)
          .expect(201);

        expect(response.body.message).toBe('Payment created successfully');
        expect(response.body.payment.type).toBe('subscription');
        expect(response.body.payment.amount).toBe('9.99');
        expect(response.body.payment.status).toBe('pending');
        expect(response.body.payment.subscriptionId).toBe(subscription.id);
      });

      it('should create one-time payment successfully', async () => {
        const paymentData = {
          type: 'one_time',
          amount: 5.00,
          currency: 'USD',
          paymentMethod: 'paypal'
        };

        const response = await request(app)
          .post('/api/payments')
          .set(getAuthHeader(users.consumer.token))
          .send(paymentData)
          .expect(201);

        expect(response.body.payment.type).toBe('one_time');
        expect(response.body.payment.subscriptionId).toBeNull();
      });

      it('should require subscription ID for subscription payments', async () => {
        const paymentData = {
          type: 'subscription',
          amount: 9.99,
          paymentMethod: 'credit_card'
        };

        const response = await request(app)
          .post('/api/payments')
          .set(getAuthHeader(users.consumer.token))
          .send(paymentData)
          .expect(400);

        expect(response.body.error).toBe('Subscription ID is required for subscription payments');
      });

      it('should reject invalid payment type', async () => {
        const paymentData = {
          type: 'invalid',
          amount: 9.99,
          paymentMethod: 'credit_card'
        };

        const response = await request(app)
          .post('/api/payments')
          .set(getAuthHeader(users.consumer.token))
          .send(paymentData)
          .expect(400);

        expect(response.body.error).toBe('Payment type must be subscription or one_time');
      });

      it('should require all necessary fields', async () => {
        const response = await request(app)
          .post('/api/payments')
          .set(getAuthHeader(users.consumer.token))
          .send({})
          .expect(400);

        expect(response.body.error).toBe('Type, amount, and payment method are required');
      });
    });

    describe('PATCH /api/payments/:paymentId/process', () => {
      let payment: any;

      beforeEach(async () => {
        payment = await Payment.create({
          userId: users.consumer.id,
          type: 'one_time',
          amount: 5.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'pending'
        });
      });

      it('should process payment successfully', async () => {
        const processData = {
          status: 'completed',
          transactionId: 'txn_123456789'
        };

        const response = await request(app)
          .patch(`/api/payments/${payment.id}/process`)
          .set(getAuthHeader(users.consumer.token))
          .send(processData)
          .expect(200);

        expect(response.body.message).toBe('Payment processed successfully');
        expect(response.body.payment.status).toBe('completed');
        expect(response.body.payment.transactionId).toBe('txn_123456789');
      });

      it('should mark payment as failed', async () => {
        const processData = {
          status: 'failed'
        };

        const response = await request(app)
          .patch(`/api/payments/${payment.id}/process`)
          .set(getAuthHeader(users.consumer.token))
          .send(processData)
          .expect(200);

        expect(response.body.payment.status).toBe('failed');
      });

      it('should reject invalid status', async () => {
        const processData = {
          status: 'invalid'
        };

        const response = await request(app)
          .patch(`/api/payments/${payment.id}/process`)
          .set(getAuthHeader(users.consumer.token))
          .send(processData)
          .expect(400);

        expect(response.body.error).toBe('Status must be completed or failed');
      });

      it('should return 404 for non-existent payment', async () => {
        const response = await request(app)
          .patch('/api/payments/non-existent-id/process')
          .set(getAuthHeader(users.consumer.token))
          .send({ status: 'completed' })
          .expect(404);

        expect(response.body.error).toBe('Payment not found');
      });
    });

    describe('GET /api/payments/my-payments', () => {
      beforeEach(async () => {
        await Payment.create({
          userId: users.consumer.id,
          type: 'one_time',
          amount: 5.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed'
        });
      });

      it('should get user payments with pagination', async () => {
        const response = await request(app)
          .get('/api/payments/my-payments')
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.payments).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(Array.isArray(response.body.payments)).toBe(true);
        expect(response.body.payments.length).toBe(1);
      });

      it('should support pagination parameters', async () => {
        const response = await request(app)
          .get('/api/payments/my-payments?page=1&limit=5')
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
      });
    });

    describe('PATCH /api/payments/:paymentId/refund', () => {
      let payment: any;

      beforeEach(async () => {
        payment = await Payment.create({
          userId: users.consumer.id,
          type: 'one_time',
          amount: 5.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed'
        });
      });

      it('should refund completed payment', async () => {
        const response = await request(app)
          .patch(`/api/payments/${payment.id}/refund`)
          .set(getAuthHeader(users.consumer.token))
          .expect(200);

        expect(response.body.message).toBe('Payment refunded successfully');
        expect(response.body.payment.status).toBe('refunded');
      });

      it('should reject refund of non-completed payment', async () => {
        const pendingPayment = await Payment.create({
          userId: users.consumer.id,
          type: 'one_time',
          amount: 5.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'pending'
        });

        const response = await request(app)
          .patch(`/api/payments/${pendingPayment.id}/refund`)
          .set(getAuthHeader(users.consumer.token))
          .expect(400);

        expect(response.body.error).toBe('Only completed payments can be refunded');
      });
    });
  });

  describe('Authentication Required', () => {
    it('should require authentication for all subscription operations', async () => {
      await request(app).post('/api/subscriptions').send({}).expect(401);
      await request(app).get('/api/subscriptions/my-subscriptions').expect(401);
      await request(app).get('/api/subscriptions/my-subscribers').expect(401);
      await request(app).patch('/api/subscriptions/id/cancel').expect(401);
    });

    it('should require authentication for all payment operations', async () => {
      await request(app).post('/api/payments').send({}).expect(401);
      await request(app).get('/api/payments/my-payments').expect(401);
      await request(app).patch('/api/payments/id/process').send({}).expect(401);
      await request(app).patch('/api/payments/id/refund').expect(401);
    });
  });
});