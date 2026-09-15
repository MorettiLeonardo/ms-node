import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@src/config/index.js';
import { AppError } from '@src/errors/index.js';
import { logger } from '@src/utils/index.js';
import { BEARER_PREFIX, UNAUTHORIZED_MISSING_TOKEN, UNAUTHORIZED_INVALID_TOKEN } from '@src/constants/index.js';
import type { JwtUserPayload, ILogger } from '@src/types/shared/index.js';

export class AuthMiddleware {
  constructor(private readonly logger_service: ILogger = logger) {
    this.authenticate = this.authenticate.bind(this);
  }

  authenticate(req: Request, _res: Response, next: NextFunction): void {
    try {
      this.logger_service.info('init', { method: 'authenticate', path: req.path });

      const authorization_header = req.headers.authorization;
      if (!authorization_header || !authorization_header.startsWith(BEARER_PREFIX)) {
        throw new AppError(401, UNAUTHORIZED_MISSING_TOKEN);
      }

      const token = authorization_header.slice(BEARER_PREFIX.length).trim();
      if (!token) {
        throw new AppError(401, UNAUTHORIZED_MISSING_TOKEN);
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role
      };

      this.logger_service.info('finish', { method: 'authenticate', user_id: decoded.sub });
      next();
    } catch (error) {
      this.logger_service.error('error', { method: 'authenticate', error });
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError(401, UNAUTHORIZED_INVALID_TOKEN));
    }
  }
}
