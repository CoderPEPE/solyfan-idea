import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { IPost } from '../types';
import User from './User';

class Post extends Model<IPost> implements IPost {
  public id!: string;
  public userId!: string;
  public title!: string;
  public content?: string;
  public mediaUrls!: string[];
  public mediaTypes!: string[];
  public isPublic!: boolean;
  public likesCount!: number;
  public commentsCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init({
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mediaUrls: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mediaTypes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'posts'
});

export default Post;