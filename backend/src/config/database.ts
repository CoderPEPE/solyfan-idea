import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is required');
}

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  // Force IPv4 by setting host explicitly
  host: 'db.nuxigwqqxiauglsijxff.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'bd167815cbc274b369e0c05deff7'
});

export default sequelize;