import dotenv from 'dotenv';
import { z } from 'zod';
import {
  DEFAULT_PORT,
  DEFAULT_AUTH_SERVICE_URL,
  DEFAULT_USER_SERVICE_URL,
  DEFAULT_CORS_ORIGIN
} from '@src/constants/index.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default(String(DEFAULT_PORT))
    .transform((val) => Number.parseInt(val, 10)),
  AUTH_SERVICE_URL: z.string().url().default(DEFAULT_AUTH_SERVICE_URL),
  USER_SERVICE_URL: z.string().url().default(DEFAULT_USER_SERVICE_URL),
  CORS_ORIGIN: z.string().default(DEFAULT_CORS_ORIGIN)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  process.stderr.write(`Invalid environment variables: ${JSON.stringify(parsedEnv.error.format())}\n`);
  process.exit(1);
}

export const env = parsedEnv.data;
