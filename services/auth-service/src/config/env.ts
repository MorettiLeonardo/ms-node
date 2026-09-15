import dotenv from 'dotenv';
import { DEFAULT_PORT, DEFAULT_JWT_EXPIRES_IN } from '@src/constants/index.js';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT) || DEFAULT_PORT,
  DATABASE_URL: process.env.DATABASE_URL ?? 'mysql://auth_user:auth_password@localhost:3306/learns_auth_db',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev_jwt_super_secret_key_change_in_production_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*'
} as const;
