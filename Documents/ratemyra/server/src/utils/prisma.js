import { PrismaClient } from '@prisma/client';

let prisma = null;

/**
 * Get Prisma client instance, creating it if needed
 * Returns null if DATABASE_URL is not set
 */
export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!prisma) {
    try {
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error.message);
      return null;
    }
  }

  return prisma;
}

/**
 * Get Prisma client or throw error
 */
export function requirePrisma() {
  const client = getPrismaClient();
  if (!client) {
    throw new Error('Database not configured. DATABASE_URL is required.');
  }
  return client;
}

export default getPrismaClient;
