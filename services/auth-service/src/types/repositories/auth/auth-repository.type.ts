import type { Prisma, Account, RefreshToken } from '@prisma/client';
import type { ResultTuple } from '@src/types/shared/index.js';

export interface CreateAccountPayload {
  email: string;
  password_hash: string;
  role?: string;
}

export interface CreateRefreshTokenPayload {
  account_id: string;
  token_hash: string;
  expires_at: Date;
}

export type RefreshTokenWithAccount = RefreshToken & { account: Account };

export interface IAuthRepository {
  createAccount(
    payload: CreateAccountPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<Account>>;
  findAccountByEmail(email: string): Promise<ResultTuple<Account | null>>;
  findAccountById(id: string): Promise<ResultTuple<Account | null>>;
  createRefreshToken(
    payload: CreateRefreshTokenPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<RefreshToken>>;
  findRefreshToken(token_hash: string): Promise<ResultTuple<RefreshTokenWithAccount | null>>;
  revokeRefreshToken(token_hash: string): Promise<ResultTuple<RefreshToken>>;
  revokeAllAccountTokens(account_id: string): Promise<ResultTuple<number>>;
}
