import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@src/errors/index.js';
import { logger } from '@src/utils/index.js';

export class ErrorMiddleware {
  static handle(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
      logger.warn(err.message, { status_code: err.status_code });
      res.status(err.status_code).json({
        status: 'error',
        message: err.message
      });
      return;
    }

    if (err instanceof ZodError) {
      const formatted_errors = err.errors.map((e) => {
        const error_item = {
          field: e.path.join('.'),
          message: e.message
        };
        return error_item;
      });

      logger.warn('Validation error', { errors: formatted_errors });
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: formatted_errors
      });
      return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        logger.warn('Prisma unique constraint violation', { target: err.meta?.target });
        res.status(409).json({
          status: 'fail',
          message: 'A record with this field already exists',
          target: err.meta?.target
        });
        return;
      }

      if (err.code === 'P2025') {
        logger.warn('Prisma record not found');
        res.status(404).json({
          status: 'fail',
          message: 'Resource not found'
        });
        return;
      }
    }

    logger.error('Unhandled internal server error', { error: err });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}
