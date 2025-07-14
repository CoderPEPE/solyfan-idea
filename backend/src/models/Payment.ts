import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { IPayment } from '../types';
import User from './User';
import Subscription from './Subscription';

class Payment extends Model<IPayment> implements IPayment {
  public id!: string;
  public userId!: string;
  public subscriptionId?: string;
  public type!: 'subscription' | 'one_time';
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'completed' | 'failed' | 'refunded';
  public paymentMethod!: string;
  public transactionId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Subscription,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('subscription', 'one_time'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'payments'
});

export default Payment;