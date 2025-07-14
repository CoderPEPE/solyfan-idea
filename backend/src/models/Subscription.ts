import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ISubscription } from '../types';
import User from './User';

class Subscription extends Model<ISubscription> implements ISubscription {
  public id!: string;
  public userId!: string;
  public subscriberId!: string;
  public type!: 'monthly' | 'annual';
  public amount!: number;
  public status!: 'active' | 'cancelled' | 'expired';
  public startDate!: Date;
  public endDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init({
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
  subscriberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('monthly', 'annual'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Subscription',
  tableName: 'subscriptions'
});

export default Subscription;