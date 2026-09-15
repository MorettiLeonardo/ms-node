import type { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '@src/errors/index.js';
import { logger } from '@src/utils/index.js';
import type { IAuthRepository } from '@src/types/repositories/index.js';
import type { ILogger } from '@src/types/shared/index.js';

interface RequestWithEmail {
  email: string;
}

export class AuthMiddleware {
  constructor(
    private readonly auth_repository: IAuthRepository,
    private readonly logger_service: ILogger = logger
  ) {
    this.validate_unique_email = this.validate_unique_email.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.validate_account_active = this.validate_account_active.bind(this);
  }

  async validate_unique_email(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      const body = req.body as RequestWithEmail;
      this.logger_service.info('init', { method: 'validate_unique_email', email: body?.email });

      const [existing_account, error] = await this.auth_repository.findAccountByEmail(body.email);
      if (error) {
        throw error;
      }

      if (existing_account) {
        throw new AppError(409, `Account with email "${body.email}" already exists`);
      }
    } catch (error) {
      this.logger_service.error('error', { method: 'validate_unique_email', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'validate_unique_email' });
    }
  }

  async authenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'authenticate' });
      await req.jwtVerify();
    } catch (error) {
      this.logger_service.error('error', { method: 'authenticate', error });
      throw new AppError(401, 'Unauthorized: Invalid or missing token');
    } finally {
      this.logger_service.info('finish', { method: 'authenticate' });
    }
  }

  async validate_account_active(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      const user_id = req.user.sub;
      this.logger_service.info('init', { method: 'validate_account_active', user_id });

      const [account, error] = await this.auth_repository.findAccountById(user_id);
      if (error) {
        throw error;
      }

      if (!account) {
        throw new AppError(404, 'Account not found');
      }

      if (!account.is_active) {
        throw new AppError(403, 'Account is deactivated');
      }
    } catch (error) {
      this.logger_service.error('error', { method: 'validate_account_active', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'validate_account_active' });
    }
  }
}
