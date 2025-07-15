import { DataTypes, Model, Association, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types';
import Post from './Post';

class User extends Model<IUser> implements IUser {
  public id!: string;
  public email!: string;
  public password!: string;
  public username?: string;
  public avatar?: string;
  public bio?: string;
  public role!: 'admin' | 'creator' | 'consumer';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public posts?: Post[]; // Will be populated when including posts
  public getPosts!: HasManyGetAssociationsMixin<any>; // Method to get posts

  // Association static property
  public static associations: {
    posts: Association<User, Post>;
  };
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'creator', 'consumer'),
    allowNull: false,
    defaultValue: 'consumer'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

export default User;