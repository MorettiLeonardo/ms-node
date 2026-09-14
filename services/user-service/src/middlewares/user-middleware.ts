import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@src/errors/index.js';
import type { IUserRepository } from '@src/types/repositories/index.js';

export class UserMiddleware {
  constructor(private readonly user_repository: IUserRepository) {
    this.validate_unique_email = this.validate_unique_email.bind(this);
    this.validate_user_exists = this.validate_user_exists.bind(this);
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

  async validate_unique_email(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;
    const [existing_user, error] = await this.user_repository.findByEmail({ email });

    if (error) {
      next(error);
      return;
    }

    if (existing_user) {
      next(new AppError(409, `User with email "${email}" already exists`));
      return;
    }

    next();
  }

  async validate_user_exists(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user_id = UserMiddleware.extract_param_id(req);
    const [user, error] = await this.user_repository.findById({ user_id });

    if (error) {
      next(error);
      return;
    }

    if (!user) {
      next(new AppError(404, `User with ID "${user_id}" not found`));
      return;
    }

    res.locals.user = user;
    next();
  }
}
