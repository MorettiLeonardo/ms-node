import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@src/constants/index.js';

export class PasswordHasher {
  static async hash(password: string): Promise<string> {
    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    return hashed;
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    const is_match = await bcrypt.compare(password, hash);
    return is_match;
  }

  static hashToken(token: string): string {
    const hashed_token = crypto.createHash('sha256').update(token).digest('hex');
    return hashed_token;
  }

  static generateRandomToken(): string {
    const token = crypto.randomBytes(40).toString('hex');
    return token;
  }
}
