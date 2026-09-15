import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '@src/config/env.js';
import { logger } from '@src/utils/index.js';
import type { ILogger, ServiceHealthStatus, GatewayHealthResponse } from '@src/types/shared/index.js';

const START_TIME = Date.now();
const PING_TIMEOUT_MS = 2000;

export class HealthController {
  constructor(private readonly logger_service: ILogger = logger) {
    this.check = this.check.bind(this);
  }

  private static async check_service(url: string): Promise<ServiceHealthStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      const response = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timer);

      const latency_ms = Date.now() - start;
      if (response.ok) {
        return { status: 'healthy', latency_ms };
      }

      return {
        status: 'unhealthy',
        latency_ms,
        error: `HTTP ${response.status}`
      };
    } catch (error) {
      const latency_ms = Date.now() - start;
      const error_message = error instanceof Error ? error.message : String(error);
      return {
        status: 'unhealthy',
        latency_ms,
        error: error_message
      };
    }
  }

  async check(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      this.logger_service.info('init', { method: 'check' });

      const [auth_health, user_health] = await Promise.all([
        HealthController.check_service(env.AUTH_SERVICE_URL),
        HealthController.check_service(env.USER_SERVICE_URL)
      ]);

      let is_all_healthy = true;
      if (auth_health.status !== 'healthy' || user_health.status !== 'healthy') {
        is_all_healthy = false;
      }

      const uptime_seconds = Math.floor((Date.now() - START_TIME) / 1000);
      const overall_status = is_all_healthy ? 'healthy' : 'degraded';

      const response: GatewayHealthResponse = {
        status: overall_status,
        timestamp: new Date().toISOString(),
        uptime_seconds,
        services: {
          auth_service: auth_health,
          user_service: user_health
        }
      };

      const status_code = is_all_healthy ? 200 : 503;
      reply.status(status_code).send(response);
    } catch (error) {
      this.logger_service.error('error', { method: 'check', error });
      reply.status(500).send({
        status: 'error',
        message: 'Failed to compute gateway health'
      });
    } finally {
      this.logger_service.info('finish', { method: 'check' });
    }
  }
}
