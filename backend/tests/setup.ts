import { Sequelize } from 'sequelize';
import '../src/models';

// Test database configuration
export const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Setup test database before all tests
beforeAll(async () => {
  // Override the database connection for tests
  const { User, Post, Comment, Like, Subscription, Payment } = require('../src/models');
  
  // Initialize models with test database
  User.sequelize = testSequelize;
  Post.sequelize = testSequelize;
  Comment.sequelize = testSequelize;
  Like.sequelize = testSequelize;
  Subscription.sequelize = testSequelize;
  Payment.sequelize = testSequelize;

  await testSequelize.sync({ force: true });
});

// Clean up after all tests
afterAll(async () => {
  await testSequelize.close();
});

// Clean database before each test
beforeEach(async () => {
  await testSequelize.sync({ force: true });
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.EMAIL_HOST = 'test-smtp';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.S3_BUCKET_NAME = 'test-bucket';