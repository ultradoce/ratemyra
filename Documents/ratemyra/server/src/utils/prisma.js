import { PrismaClient } from '@prisma/client';

let prisma = null;

/**
 * Get Prisma client instance, creating it if needed
 * Returns null if DATABASE_URL is not set
 */
export function getPrismaClient() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL not found in environment variables');
    return null;
  }

  // Log that we found DATABASE_URL (but don't log the actual URL for security)
  if (!prisma) {
    console.log('✅ DATABASE_URL found, initializing Prisma client...');
    try {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      console.log('✅ Prisma client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Prisma client:', error.message);
      console.error('Error details:', error);
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
