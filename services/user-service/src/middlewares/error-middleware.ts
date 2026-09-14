import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@src/errors/index.js';

export class ErrorMiddleware {
  static handle(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
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

      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: formatted_errors
      });
      return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        res.status(409).json({
          status: 'fail',
          message: 'A record with this field already exists',
          target: err.meta?.target
        });
        return;
      }

      if (err.code === 'P2025') {
        res.status(404).json({
          status: 'fail',
          message: 'Resource not found'
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}
