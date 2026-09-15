import type { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@src/utils/index.js';
import type { IHealthController } from '@src/types/controllers/index.js';
import type { ILogger } from '@src/types/shared/index.js';

export class HealthController implements IHealthController {
  constructor(private readonly logger_service: ILogger = logger) {
    this.check = this.check.bind(this);
  }

  async check(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'check' });

      const response_data = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service'
      };

      reply.status(200).send(response_data);
    } catch (error) {
      this.logger_service.error('error', { method: 'check', error });
      throw error;
    } finally {
      this.logger_service.info('finish', { method: 'check' });
    }
  }
}
