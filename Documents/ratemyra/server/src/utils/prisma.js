import { PrismaClient } from '@prisma/client';

let prisma = null;

/**
 * Get Prisma client instance, creating it if needed
 * Returns null if DATABASE_URL is not set
 */
export function getPrismaClient() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('🔍 getPrismaClient called');
  console.log('   DATABASE_URL exists:', !!databaseUrl);
  console.log('   DATABASE_URL length:', databaseUrl?.length || 0);
  console.log('   DATABASE_URL starts with:', databaseUrl?.substring(0, 12) || 'N/A');
  console.log('   Prisma instance exists:', !!prisma);
  
  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL not found in environment variables');
    console.warn('   All env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')));
    return null;
  }

  // Log that we found DATABASE_URL (but don't log the actual URL for security)
  if (!prisma) {
    console.log('✅ DATABASE_URL found, initializing Prisma client...');
    console.log('   DATABASE_URL format looks valid:', databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'));
    try {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      console.log('✅ Prisma client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Prisma client:', error.message);
      console.error('   Error name:', error.name);
      console.error('   Error code:', error.code);
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      return null;
    }
  } else {
    console.log('✅ Using existing Prisma client instance');
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
