import { Router } from 'express';
import { UserSchema } from '@src/schemas/index.js';
import type { UserMiddleware } from '@src/middlewares/index.js';
import type { IUserController } from '@src/types/controllers/index.js';

export class UserRouter {
  public readonly router: Router;

  constructor(
    private readonly controller: IUserController,
    private readonly middleware: UserMiddleware
  ) {
    this.router = Router();
    this.register_routes();
  }

  private register_routes(): void {
    this.router.post('/', UserSchema.create, this.middleware.validate_unique_email, this.controller.create);
    this.router.get('/', UserSchema.findAll, this.controller.findAll);
    this.router.get('/:id', UserSchema.findOne, this.middleware.validate_user_exists, this.controller.findOne);
    this.router.put('/:id', UserSchema.update, this.middleware.validate_user_exists, this.controller.update);
    this.router.delete('/:id', UserSchema.remove, this.middleware.validate_user_exists, this.controller.remove);
  }
}
