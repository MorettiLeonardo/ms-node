import { PrismaClient } from '@prisma/client';

declare global {
  var globalPrisma: PrismaClient | undefined;
}

export class PrismaService {
  public readonly client: PrismaClient;

  constructor() {
    this.client =
      globalThis.globalPrisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
      });

    if (process.env.NODE_ENV !== 'production') {
      globalThis.globalPrisma = this.client;
    }
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
    } catch (error) {
      process.stderr.write(`Failed to connect to PostgreSQL: ${String(error)}\n`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export const prismaService = new PrismaService();
export const prisma = prismaService.client;
