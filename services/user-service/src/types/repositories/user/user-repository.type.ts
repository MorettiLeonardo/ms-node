import type { Prisma, User } from '@prisma/client';
import type { ResultTuple } from '@src/types/shared/index.js';

export interface CreateUserPayload {
  email: string;
  name: string;
  role?: string;
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  role?: string;
}

export interface IUserRepository {
  create(payload: CreateUserPayload, options?: { transaction?: Prisma.TransactionClient }): Promise<ResultTuple<User>>;
  findById(params: { user_id: string }): Promise<ResultTuple<User>>;
  findByEmail(params: { email: string }): Promise<ResultTuple<User>>;
  findMany(params: { skip: number; take: number }): Promise<ResultTuple<User[]>>;
  update(
    params: { user_id: string; payload: UpdateUserPayload },
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>>;
  delete(params: { user_id: string }, options?: { transaction?: Prisma.TransactionClient }): Promise<ResultTuple<User>>;
  count(): Promise<ResultTuple<number>>;
}
