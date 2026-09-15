import { PrismaClient } from '@prisma/client';

export class PrismaService {
  public readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      log: []
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
    } catch (error) {
      process.stderr.write(`Failed to establish MySQL connection via Prisma: ${String(error)}\n`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
    } catch (error) {
      process.stderr.write(`Error during Prisma disconnection: ${String(error)}\n`);
    }
  }
}

export const prismaService = new PrismaService();
export const prisma = prismaService.client;
