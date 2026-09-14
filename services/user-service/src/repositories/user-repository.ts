import type { Prisma, PrismaClient, User } from '@prisma/client';
import type { IUserRepository, CreateUserPayload, UpdateUserPayload } from '@src/types/repositories/index.js';
import type { ResultTuple } from '@src/types/shared/index.js';

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    payload: CreateUserPayload,
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      const user = await client.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          role: payload.role ?? 'USER'
        }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async findById(params: { user_id: string }): Promise<ResultTuple<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: params.user_id }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async findByEmail(params: { email: string }): Promise<ResultTuple<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: params.email }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async findMany(params: { skip: number; take: number }): Promise<ResultTuple<User[]>> {
    try {
      const users = await this.prisma.user.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' }
      });
      const result: ResultTuple<User[]> = [users, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User[]> = [null, error as Error];
      return result;
    }
  }

  async update(
    params: { user_id: string; payload: UpdateUserPayload },
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      const user = await client.user.update({
        where: { id: params.user_id },
        data: params.payload
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async delete(
    params: { user_id: string },
    options?: { transaction?: Prisma.TransactionClient }
  ): Promise<ResultTuple<User>> {
    const client = options?.transaction ?? this.prisma;
    try {
      const user = await client.user.delete({
        where: { id: params.user_id }
      });
      const result: ResultTuple<User> = [user, null];
      return result;
    } catch (error) {
      const result: ResultTuple<User> = [null, error as Error];
      return result;
    }
  }

  async count(): Promise<ResultTuple<number>> {
    try {
      const total = await this.prisma.user.count();
      const result: ResultTuple<number> = [total, null];
      return result;
    } catch (error) {
      const result: ResultTuple<number> = [null, error as Error];
      return result;
    }
  }
}
