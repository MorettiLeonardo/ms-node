import { logger } from '@src/utils/index.js';

import type { Request, Response, NextFunction } from 'express';
import type { IUserController } from '@src/types/controllers/index.js';
import type { IUserService } from '@src/types/services/index.js';
import type { ILogger } from '@src/types/shared/index.js';

export class UserController implements IUserController {
  constructor(
    private readonly user_service: IUserService,
    private readonly logger_service: ILogger = logger
  ) {
    this.create = this.create.bind(this);
    this.findOne = this.findOne.bind(this);
    this.findAll = this.findAll.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  private static extract_param_id(req: Request): string {
    let user_id = '';
    if (Array.isArray(req.params.id)) {
      user_id = req.params.id[0];
    } else {
      user_id = req.params.id;
    }
    return user_id;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'create', body: req.body });

      const params = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role
      };

      const [user, error] = await this.user_service.create(params);
      if (error) {
        next(error);
        return;
      }

      res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      this.logger_service.error('error', { method: 'create', error });
      next(error);
    } finally {
      this.logger_service.info('finish', { method: 'create' });
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user_id = UserController.extract_param_id(req);
      this.logger_service.info('init', { method: 'findOne', user_id });

      const params = { user_id };
      const [result, error] = await this.user_service.findOne(params);

      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result?.user,
        meta: {
          fromCache: result?.is_from_cache
        }
      });
    } catch (error) {
      this.logger_service.error('error', { method: 'findOne', error });
      next(error);
    } finally {
      this.logger_service.info('finish', { method: 'findOne' });
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'findAll', query: req.query });

      const params = {
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined
      };

      const [result, error] = await this.user_service.findAll(params);
      if (error) {
        next(error);
        return;
      }

      const total_records = result?.total ?? 0;
      const current_limit = result?.limit ?? 10;
      const total_pages = Math.ceil(total_records / current_limit);

      res.status(200).json({
        status: 'success',
        data: result?.users,
        pagination: {
          total: total_records,
          page: result?.page,
          limit: current_limit,
          totalPages: total_pages
        }
      });
    } catch (error) {
      this.logger_service.error('error', { method: 'findAll', error });
      next(error);
    } finally {
      this.logger_service.info('finish', { method: 'findAll' });
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user_id = UserController.extract_param_id(req);
      this.logger_service.info('init', { method: 'update', user_id });

      const params = {
        user_id,
        email: req.body.email,
        name: req.body.name,
        role: req.body.role
      };

      const [user, error] = await this.user_service.update(params);
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      this.logger_service.error('error', { method: 'update', error });
      next(error);
    } finally {
      this.logger_service.info('finish', { method: 'update' });
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user_id = UserController.extract_param_id(req);
      this.logger_service.info('init', { method: 'remove', user_id });

      const params = { user_id };
      const [, error] = await this.user_service.remove(params);

      if (error) {
        next(error);
        return;
      }

      res.status(204).send();
    } catch (error) {
      this.logger_service.error('error', { method: 'remove', error });
      next(error);
    } finally {
      this.logger_service.info('finish', { method: 'remove' });
    }
  }
}
