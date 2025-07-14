import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { IComment } from '../types';
import User from './User';
import Post from './Post';

class Comment extends Model<IComment> implements IComment {
  public id!: string;
  public postId!: string;
  public userId!: string;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init({
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
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments'
});

export default Comment;