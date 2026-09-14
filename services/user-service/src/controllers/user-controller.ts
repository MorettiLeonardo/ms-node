import type { Request, Response, NextFunction } from 'express';
import type { IUserController } from '@src/types/controllers/index.js';
import type { IUserService } from '@src/types/services/index.js';

export class UserController implements IUserController {
  constructor(private readonly user_service: IUserService) {
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
  }

  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user_id = UserController.extract_param_id(req);
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
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user_id = UserController.extract_param_id(req);
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
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user_id = UserController.extract_param_id(req);
    const params = { user_id };
    const [, error] = await this.user_service.remove(params);

    if (error) {
      next(error);
      return;
    }

    res.status(204).send();
  }
}
