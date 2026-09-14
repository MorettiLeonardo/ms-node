import type { Request, Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import type Redis from 'ioredis';
import type { IHealthController } from '@src/types/controllers/index.js';
import type { ILogger } from '@src/types/shared/index.js';
import { logger } from '@src/utils/index.js';

export class HealthController implements IHealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis_client: Redis,
    private readonly logger_service: ILogger = logger
  ) {
    this.check = this.check.bind(this);
  }

  async check(_req: Request, res: Response): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'check' });

      let postgres_status = 'unknown';
      let redis_status = 'unknown';
      let is_healthy = true;

      try {
        await this.prisma.$queryRaw`SELECT 1`;
        postgres_status = 'connected';
      } catch {
        postgres_status = 'disconnected';
        is_healthy = false;
      }

      try {
        const ping_response = await this.redis_client.ping();
        if (ping_response === 'PONG') {
          redis_status = 'connected';
        } else {
          redis_status = 'unresponsive';
          is_healthy = false;
        }
      } catch {
        redis_status = 'disconnected';
        is_healthy = false;
      }

      let status_code = 503;
      if (is_healthy) {
        status_code = 200;
      }

      let health_status = 'degraded';
      if (is_healthy) {
        health_status = 'healthy';
      }

      res.status(status_code).json({
        status: health_status,
        timestamp: new Date().toISOString(),
        services: {
          postgres: postgres_status,
          redis: redis_status
        }
      });
    } catch (error) {
      this.logger_service.error('error', { method: 'check', error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    } finally {
      this.logger_service.info('finish', { method: 'check' });
    }
  }
}
