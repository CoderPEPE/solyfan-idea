import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ILike } from '../types';
import User from './User';
import Post from './Post';

class Like extends Model<ILike> implements ILike {
  public id!: string;
  public postId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
}

Like.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Post,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['postId', 'userId']
    }
  ]
});

export default Like;