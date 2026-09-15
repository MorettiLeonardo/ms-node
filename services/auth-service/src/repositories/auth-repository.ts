import { logger } from '@src/utils/index.js';
import type { Prisma, PrismaClient, Account, RefreshToken } from '@prisma/client';
import type { ResultTuple, ILogger } from '@src/types/shared/index.js';
import * as T from '@src/types/repositories/index.js';

export class AuthRepository implements T.IAuthRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger_service: ILogger = logger
  ) {}

  async createAccount(
    payload: T.CreateAccountPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<Account>> {
    const client = options?.transaction ?? this.prisma;
    try {
      this.logger_service.info('init', { method: 'createAccount', email: payload.email });

      const account = await client.account.create({
        data: {
          email: payload.email,
          password_hash: payload.password_hash,
          role: payload.role ?? 'USER'
        }
      });

      const result: ResultTuple<Account> = [account, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'createAccount', error, email: payload.email });
      const result: ResultTuple<Account> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'createAccount' });
    }
  }

  async findAccountByEmail(email: string): Promise<ResultTuple<Account | null>> {
    try {
      this.logger_service.info('init', { method: 'findAccountByEmail', email });

      const account = await this.prisma.account.findUnique({
        where: { email }
      });

      const result: ResultTuple<Account | null> = [account, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findAccountByEmail', error, email });
      const result: ResultTuple<Account | null> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findAccountByEmail' });
    }
  }

  async findAccountById(id: string): Promise<ResultTuple<Account | null>> {
    try {
      this.logger_service.info('init', { method: 'findAccountById', id });

      const account = await this.prisma.account.findUnique({
        where: { id }
      });

      const result: ResultTuple<Account | null> = [account, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findAccountById', error, id });
      const result: ResultTuple<Account | null> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findAccountById' });
    }
  }

  async createRefreshToken(
    payload: T.CreateRefreshTokenPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<RefreshToken>> {
    const client = options?.transaction ?? this.prisma;
    try {
      this.logger_service.info('init', { method: 'createRefreshToken', account_id: payload.account_id });

      const token = await client.refreshToken.create({
        data: {
          account_id: payload.account_id,
          token_hash: payload.token_hash,
          expires_at: payload.expires_at
        }
      });

      const result: ResultTuple<RefreshToken> = [token, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'createRefreshToken', error, account_id: payload.account_id });
      const result: ResultTuple<RefreshToken> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'createRefreshToken' });
    }
  }

  async findRefreshToken(token_hash: string): Promise<ResultTuple<T.RefreshTokenWithAccount | null>> {
    try {
      this.logger_service.info('init', { method: 'findRefreshToken' });

      const token = await this.prisma.refreshToken.findUnique({
        where: { token_hash },
        include: { account: true }
      });

      const result: ResultTuple<T.RefreshTokenWithAccount | null> = [token, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'findRefreshToken', error });
      const result: ResultTuple<T.RefreshTokenWithAccount | null> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'findRefreshToken' });
    }
  }

  async revokeRefreshToken(token_hash: string): Promise<ResultTuple<RefreshToken>> {
    try {
      this.logger_service.info('init', { method: 'revokeRefreshToken' });

      const token = await this.prisma.refreshToken.update({
        where: { token_hash },
        data: { revoked: true }
      });

      const result: ResultTuple<RefreshToken> = [token, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'revokeRefreshToken', error });
      const result: ResultTuple<RefreshToken> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'revokeRefreshToken' });
    }
  }

  async revokeAllAccountTokens(account_id: string): Promise<ResultTuple<number>> {
    try {
      this.logger_service.info('init', { method: 'revokeAllAccountTokens', account_id });

      const update_result = await this.prisma.refreshToken.updateMany({
        where: { account_id, revoked: false },
        data: { revoked: true }
      });

      const result: ResultTuple<number> = [update_result.count, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'revokeAllAccountTokens', error, account_id });
      const result: ResultTuple<number> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'revokeAllAccountTokens' });
    }
  }
}
