import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AppError } from '@src/errors/index.js';

const register_body_schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().optional()
});

const login_body_schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const refresh_body_schema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

const logout_body_schema = z.object({
  refresh_token: z.string().optional()
});

export class AuthSchema {
  private static handle_zod_error(error: unknown): never {
    if (error instanceof z.ZodError) {
      const error_messages = error.errors.map((err) => err.message);
      const formatted_message = error_messages.join(', ');
      throw new AppError(400, formatted_message);
    }
    throw error;
  }

  static async register(req: FastifyRequest): Promise<void> {
    try {
      const parsed_body = register_body_schema.parse(req.body);
      req.body = parsed_body;
    } catch (error) {
      AuthSchema.handle_zod_error(error);
    }
  }

  static async login(req: FastifyRequest): Promise<void> {
    try {
      const parsed_body = login_body_schema.parse(req.body);
      req.body = parsed_body;
    } catch (error) {
      AuthSchema.handle_zod_error(error);
    }
  }

  static async refresh(req: FastifyRequest): Promise<void> {
    try {
      const parsed_body = refresh_body_schema.parse(req.body);
      req.body = parsed_body;
    } catch (error) {
      AuthSchema.handle_zod_error(error);
    }
  }

  static async logout(req: FastifyRequest): Promise<void> {
    try {
      const parsed_body = logout_body_schema.parse(req.body);
      req.body = parsed_body;
    } catch (error) {
      AuthSchema.handle_zod_error(error);
    }
  }
}
