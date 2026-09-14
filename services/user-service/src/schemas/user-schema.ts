import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const create_user_schema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional()
});

const update_user_schema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  role: z.string().optional()
});

const id_param_schema = z.object({
  id: z.string().min(1, 'ID is required')
});

const list_query_schema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      let page_number;
      if (val) {
        page_number = Number(val);
      } else {
        page_number = 1;
      }
      return page_number;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      let limit_number;
      if (val) {
        limit_number = Number(val);
      } else {
        limit_number = 10;
      }
      return limit_number;
    })
});

export class UserSchema {
  static create(req: Request, _res: Response, next: NextFunction): void {
    try {
      req.body = create_user_schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  static findOne(req: Request, _res: Response, next: NextFunction): void {
    try {
      req.params = id_param_schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  }

  static findAll(req: Request, _res: Response, next: NextFunction): void {
    try {
      const parsed_query = list_query_schema.parse(req.query);
      req.query = parsed_query as unknown as Request['query'];
      next();
    } catch (error) {
      next(error);
    }
  }

  static update(req: Request, _res: Response, next: NextFunction): void {
    try {
      req.params = id_param_schema.parse(req.params);
      req.body = update_user_schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  static remove(req: Request, _res: Response, next: NextFunction): void {
    try {
      req.params = id_param_schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  }
}
