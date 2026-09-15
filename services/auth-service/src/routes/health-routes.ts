import type { FastifyInstance } from 'fastify';
import type { IHealthController } from '@src/types/controllers/index.js';

const health_route_schema = {
  tags: ['Health'],
  summary: 'Service health check',
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        service: { type: 'string' }
      }
    }
  }
};

export class HealthRouter {
  constructor(private readonly controller: IHealthController) {
    this.register = this.register.bind(this);
  }

  async register(fastify: FastifyInstance): Promise<void> {
    fastify.get('/health', { schema: health_route_schema }, this.controller.check);
  }
}
