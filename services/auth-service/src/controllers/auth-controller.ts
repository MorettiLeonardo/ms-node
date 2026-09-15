import { logger } from '@src/utils/index.js';

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { IAuthController } from '@src/types/controllers/index.js';
import type * as T from '@src/types/services/index.js';
import type { ILogger } from '@src/types/shared/index.js';

export class AuthController implements IAuthController {
  constructor(
    private readonly auth_service: T.IAuthService,
    private readonly logger_service: ILogger = logger
  ) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
    this.me = this.me.bind(this);
  }

  async register(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = req.body as T.RegisterBody;
      this.logger_service.info('init', { method: 'register', email: body?.email });

      const params: T.RegisterParams = {
        email: body.email,
        password: body.password,
        role: body.role
      };

      const [session, error] = await this.auth_service.register(params);
      if (error) {
        throw error;
      }

      const response_data: T.AuthSessionResponse = {
        status: 'success',
        data: session
      };

      reply.status(201).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'register', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'register' });
    }
  }

  async login(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = req.body as T.LoginBody;
      this.logger_service.info('init', { method: 'login', email: body?.email });

      const params: T.LoginParams = {
        email: body.email,
        password: body.password
      };

      const [session, error] = await this.auth_service.login(params);
      if (error) {
        throw error;
      }

      const response_data: T.AuthSessionResponse = {
        status: 'success',
        data: session
      };

      reply.status(200).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'login', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'login' });
    }
  }

  async refresh(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = req.body as T.RefreshBody;
      this.logger_service.info('init', { method: 'refresh' });

      const params: T.RefreshParams = {
        refresh_token: body.refresh_token
      };

      const [session, error] = await this.auth_service.refresh(params);
      if (error) {
        throw error;
      }

      const response_data: T.AuthTokensResponse = {
        status: 'success',
        data: session
      };

      reply.status(200).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'refresh', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'refresh' });
    }
  }

  async logout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = (req.body ?? {}) as T.LogoutBody;
      const account_id = req.user?.sub;
      this.logger_service.info('init', { method: 'logout', account_id });

      const params: T.LogoutParams = {
        account_id,
        refresh_token: body.refresh_token
      };

      const [, error] = await this.auth_service.logout(params);
      if (error) {
        throw error;
      }

      const response_data: T.MessageResponse = {
        status: 'success',
        message: 'Logged out successfully'
      };

      reply.status(200).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'logout', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'logout' });
    }
  }

  async me(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const account_id = req.user.sub;
      this.logger_service.info('init', { method: 'me', account_id });

      const [profile, error] = await this.auth_service.getProfile(account_id);
      if (error) {
        throw error;
      }

      const response_data: T.AccountProfileResponse = {
        status: 'success',
        data: profile
      };

      reply.status(200).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'me', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'me' });
    }
  }
}
