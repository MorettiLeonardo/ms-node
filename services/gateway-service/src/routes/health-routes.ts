import type { FastifyInstance } from 'fastify';
import type { HealthController } from '@src/controllers/index.js';

export class HealthRouter {
  constructor(private readonly controller: HealthController) {
    this.register = this.register.bind(this);
  }

  async register(app: FastifyInstance): Promise<void> {
    app.get('/health', this.controller.check);
  }
}
