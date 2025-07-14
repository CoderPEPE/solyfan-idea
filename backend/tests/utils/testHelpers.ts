import { User } from '../../src/models';
import { hashPassword, generateToken } from '../../src/utils/auth';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'creator' | 'consumer';
  token: string;
}

export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123',
  role: 'admin' | 'creator' | 'consumer' = 'consumer'
): Promise<TestUser> => {
  const hashedPassword = await hashPassword(password);
  
  const user = await User.create({
    email,
    password: hashedPassword,
    role
  });

  const token = generateToken({ id: user.id, email: user.email });

  return {
    id: user.id,
    email: user.email,
    password,
    role,
    token
  };
};

export const createMultipleTestUsers = async () => {
  const admin = await createTestUser('admin@example.com', 'admin123', 'admin');
  const creator = await createTestUser('creator@example.com', 'creator123', 'creator');
  const consumer = await createTestUser('consumer@example.com', 'consumer123', 'consumer');

  return { admin, creator, consumer };
};

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});