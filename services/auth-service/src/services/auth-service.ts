import type { PrismaClient } from '@prisma/client';
import * as T from '@src/types/services/index.js';
import type * as R from '@src/types/repositories/index.js';
import type { ResultTuple, ILogger } from '@src/types/shared/index.js';
import { AppError } from '@src/errors/index.js';
import { PasswordHasher, logger } from '@src/utils/index.js';
import {
  DEFAULT_ROLE,
  DEFAULT_REFRESH_TOKEN_EXPIRES_DAYS,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS
} from '@src/constants/index.js';

export type JwtSignFunction = (payload: { sub: string; email: string; role: string }) => string;

export class AuthService implements T.IAuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auth_repository: R.IAuthRepository,
    private readonly jwt_sign: JwtSignFunction,
    private readonly logger_service: ILogger = logger
  ) {}

  private static calculate_refresh_expiration(): Date {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + DEFAULT_REFRESH_TOKEN_EXPIRES_DAYS);
    return expires_at;
  }

  async register(params: T.RegisterParams): Promise<ResultTuple<T.AuthSession>> {
    try {
      this.logger_service.info('init', { method: 'register', email: params.email });

      const [existing_account, err_existing] = await this.auth_repository.findAccountByEmail(params.email);
      if (err_existing) {
        throw err_existing;
      }

      if (existing_account) {
        throw new AppError(409, `Account with email "${params.email}" already exists`);
      }

      const password_hash = await PasswordHasher.hash(params.password);
      const raw_refresh_token = PasswordHasher.generateRandomToken();
      const refresh_token_hash = PasswordHasher.hashToken(raw_refresh_token);
      const expires_at = AuthService.calculate_refresh_expiration();

      const created_account = await this.prisma.$transaction(async (tx) => {
        const create_account_payload = {
          email: params.email,
          password_hash,
          role: params.role ?? DEFAULT_ROLE
        };
        const [account, err_account] = await this.auth_repository.createAccount(create_account_payload, {
          transaction: tx
        });
        if (err_account) {
          throw err_account;
        }

        const create_token_payload = {
          account_id: account.id,
          token_hash: refresh_token_hash,
          expires_at
        };
        const [, err_token] = await this.auth_repository.createRefreshToken(create_token_payload, {
          transaction: tx
        });
        if (err_token) {
          throw err_token;
        }

        return account;
      });

      const access_token = this.jwt_sign({
        sub: created_account.id,
        email: created_account.email,
        role: created_account.role
      });

      const session: T.AuthSession = {
        account: {
          id: created_account.id,
          email: created_account.email,
          role: created_account.role,
          is_active: created_account.is_active,
          created_at: created_account.created_at
        },
        tokens: {
          access_token,
          refresh_token: raw_refresh_token,
          expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }
      };

      const result: ResultTuple<T.AuthSession> = [session, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'register', error, email: params.email });
      const result: ResultTuple<T.AuthSession> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'register' });
    }
  }

  async login(params: T.LoginParams): Promise<ResultTuple<T.AuthSession>> {
    try {
      this.logger_service.info('init', { method: 'login', email: params.email });

      const [account, err_account] = await this.auth_repository.findAccountByEmail(params.email);
      if (err_account) {
        throw err_account;
      }

      if (!account) {
        throw new AppError(401, 'Invalid email or password');
      }

      const is_valid_password = await PasswordHasher.compare(params.password, account.password_hash);
      if (!is_valid_password) {
        throw new AppError(401, 'Invalid email or password');
      }

      if (!account.is_active) {
        throw new AppError(403, 'Account is disabled');
      }

      const raw_refresh_token = PasswordHasher.generateRandomToken();
      const refresh_token_hash = PasswordHasher.hashToken(raw_refresh_token);
      const expires_at = AuthService.calculate_refresh_expiration();

      const create_token_payload = {
        account_id: account.id,
        token_hash: refresh_token_hash,
        expires_at
      };
      const [, err_token] = await this.auth_repository.createRefreshToken(create_token_payload);
      if (err_token) {
        throw err_token;
      }

      const access_token = this.jwt_sign({
        sub: account.id,
        email: account.email,
        role: account.role
      });

      const session: T.AuthSession = {
        account: {
          id: account.id,
          email: account.email,
          role: account.role,
          is_active: account.is_active,
          created_at: account.created_at
        },
        tokens: {
          access_token,
          refresh_token: raw_refresh_token,
          expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }
      };

      const result: ResultTuple<T.AuthSession> = [session, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'login', error, email: params.email });
      const result: ResultTuple<T.AuthSession> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'login' });
    }
  }

  async refresh(params: T.RefreshParams): Promise<ResultTuple<T.AuthTokens>> {
    try {
      this.logger_service.info('init', { method: 'refresh' });

      const incoming_token_hash = PasswordHasher.hashToken(params.refresh_token);
      const [token_record, err_token] = await this.auth_repository.findRefreshToken(incoming_token_hash);
      if (err_token) {
        throw err_token;
      }

      if (!token_record || token_record.revoked || token_record.expires_at < new Date()) {
        throw new AppError(401, 'Invalid or expired refresh token');
      }

      if (!token_record.account.is_active) {
        throw new AppError(403, 'Account is disabled');
      }

      const raw_new_refresh_token = PasswordHasher.generateRandomToken();
      const new_refresh_token_hash = PasswordHasher.hashToken(raw_new_refresh_token);
      const expires_at = AuthService.calculate_refresh_expiration();

      await this.prisma.$transaction(async (tx) => {
        const [, err_revoke] = await this.auth_repository.revokeRefreshToken(incoming_token_hash);
        if (err_revoke) {
          throw err_revoke;
        }

        const create_token_payload = {
          account_id: token_record.account_id,
          token_hash: new_refresh_token_hash,
          expires_at
        };
        const [, err_new_token] = await this.auth_repository.createRefreshToken(create_token_payload, {
          transaction: tx
        });
        if (err_new_token) {
          throw err_new_token;
        }
      });

      const access_token = this.jwt_sign({
        sub: token_record.account.id,
        email: token_record.account.email,
        role: token_record.account.role
      });

      const tokens: T.AuthTokens = {
        access_token,
        refresh_token: raw_new_refresh_token,
        expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
      };

      const result: ResultTuple<T.AuthTokens> = [tokens, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'refresh', error });
      const result: ResultTuple<T.AuthTokens> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'refresh' });
    }
  }

  async logout(params: T.LogoutParams): Promise<ResultTuple<boolean>> {
    try {
      this.logger_service.info('init', { method: 'logout' });

      if (params.refresh_token) {
        const token_hash = PasswordHasher.hashToken(params.refresh_token);
        const [, err_revoke] = await this.auth_repository.revokeRefreshToken(token_hash);
        if (err_revoke) {
          throw err_revoke;
        }
      }

      if (params.account_id && !params.refresh_token) {
        const [, err_revoke_all] = await this.auth_repository.revokeAllAccountTokens(params.account_id);
        if (err_revoke_all) {
          throw err_revoke_all;
        }
      }

      const result: ResultTuple<boolean> = [true, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'logout', error });
      const result: ResultTuple<boolean> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'logout' });
    }
  }

  async getProfile(account_id: string): Promise<ResultTuple<T.AccountProfile>> {
    try {
      this.logger_service.info('init', { method: 'getProfile', account_id });

      const [account, error] = await this.auth_repository.findAccountById(account_id);
      if (error) {
        throw error;
      }

      if (!account) {
        throw new AppError(404, 'Account not found');
      }

      const profile: T.AccountProfile = {
        id: account.id,
        email: account.email,
        role: account.role,
        is_active: account.is_active,
        created_at: account.created_at
      };

      const result: ResultTuple<T.AccountProfile> = [profile, null];
      return result;
    } catch (error) {
      this.logger_service.error('error', { method: 'getProfile', error, account_id });
      const result: ResultTuple<T.AccountProfile> = [null, error as Error];
      return result;
    } finally {
      this.logger_service.info('finish', { method: 'getProfile' });
    }
  }
}
