import { Request } from 'express';

export interface IUser {
  id: string;
  email: string;
  password: string;
  username?: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'creator' | 'consumer';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscription {
  id: string;
  userId: string;
  subscriberId: string;
  type: 'monthly' | 'annual';
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPayment {
  id: string;
  userId: string;
  subscriptionId?: string;
  type: 'subscription' | 'one_time';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPost {
  id: string;
  userId: string;
  title: string;
  content?: string;
  mediaUrls: string[];
  mediaTypes: string[];
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILike {
  id: string;
  postId: string;
  userId: string;
  createdAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}