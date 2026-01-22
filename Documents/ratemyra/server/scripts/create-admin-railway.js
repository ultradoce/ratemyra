/**
 * Script to create an admin user (for Railway deployment)
 * Usage: railway run node scripts/create-admin-railway.js <email> <password>
 * Or: node scripts/create-admin-railway.js <email> <password>
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-railway.js <email> <password>');
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log('✅ Admin user already exists with this email');
        console.log(`   Email: ${existing.email}`);
        console.log(`   Role: ${existing.role}`);
        process.exit(0);
      } else {
        // Upgrade existing user to admin
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: { role: 'ADMIN' },
        });
        console.log('✅ Existing user upgraded to admin');
        console.log(`   Email: ${existing.email}`);
        process.exit(0);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log('\n🎉 You can now login at: /login');
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
