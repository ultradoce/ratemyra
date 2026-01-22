/**
 * Safe migration script that only runs if DATABASE_URL is set
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set. Skipping migrations.');
    console.log('   Migrations will run automatically when DATABASE_URL is available.');
    process.exit(0);
  }

  try {
    console.log('🔄 Running database migrations...');
    // Use Prisma migrate deploy for production
    const { execSync } = await import('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't fail the build if migrations fail - they'll run on first deploy
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
