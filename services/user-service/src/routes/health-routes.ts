import { Router } from 'express';
import type { IHealthController } from '@src/types/controllers/index.js';

export class HealthRouter {
  public readonly router: Router;

  constructor(private readonly controller: IHealthController) {
    this.router = Router();
    this.register_routes();
  }

  private register_routes(): void {
    this.router.get('/', this.controller.check);
  }
}
