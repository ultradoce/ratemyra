import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import raRoutes from './routes/ra.js';
import reviewRoutes from './routes/review.js';
import schoolRoutes from './routes/school.js';
import searchRoutes from './routes/search.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ras', raRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from React app in production (before catch-all)
if (process.env.NODE_ENV === 'production') {
  // Path resolution: __dirname is /app/server/src
  // We need to go up to /app, then into client/dist
  // So: ../../client/dist from server/src
  const clientPath = path.join(__dirname, '../../client/dist');
  const absolutePath = path.resolve(clientPath);
  
  console.log(`🔍 Looking for client dist at: ${absolutePath}`);
  console.log(`   __dirname: ${__dirname}`);
  console.log(`   Current working directory: ${process.cwd()}`);
  console.log(`   Resolved path: ${absolutePath}`);
  
  if (fs.existsSync(clientPath)) {
    console.log(`✅ Found client dist! Serving from: ${absolutePath}`);
    app.use(express.static(clientPath, { 
      index: false, // Don't serve index.html for static files
      extensions: ['html', 'js', 'css', 'json', 'png', 'jpg', 'svg']
    }));
    
    // Serve React app for all non-API routes (SPA routing)
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexPath = path.join(clientPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          console.error('   Path attempted:', indexPath);
          res.status(404).send('Frontend not found');
        }
      });
    });
  } else {
    console.warn(`⚠️  Client dist NOT found at: ${absolutePath}`);
    console.warn('   Expected path:', absolutePath);
    console.warn('   Make sure frontend is built during deployment');
    
    // Fallback: serve a simple message for root
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>RateMyRA - Backend Running</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>RateMyRA Backend Running ✅</h1>
            <p>Frontend not built. Check Railway build logs.</p>
            <p>API is available at: <a href="/api/health">/api/health</a></p>
            <p>Expected dist path: ${absolutePath}</p>
            <p>Current dir: ${process.cwd()}</p>
          </body>
        </html>
      `);
    });
  }
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for non-API routes (if frontend not found)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Create default admin account if it doesn't exist
async function ensureDefaultAdmin() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set. Skipping admin account creation.');
    console.log('   Add PostgreSQL database in Railway to enable admin account.');
    return;
  }

  try {
    const DEFAULT_ADMIN_EMAIL = 'admin@ratemyra.com';
    const DEFAULT_ADMIN_PASSWORD = 'admin123';
    
    // Test database connection first
    await prisma.$connect();
    
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL.toLowerCase() },
    });

    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log('✅ Default admin account already exists');
        return;
      } else {
        // Upgrade existing user to admin
        await prisma.user.update({
          where: { email: DEFAULT_ADMIN_EMAIL.toLowerCase() },
          data: { role: 'ADMIN' },
        });
        console.log('✅ Existing user upgraded to admin');
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Default admin account created!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    // Handle specific Prisma errors
    if (error.code === 'P1001' || error.code === 'P1012') {
      console.error('⚠️  Database connection error. Cannot create admin account.');
      console.error('   Make sure PostgreSQL is added to Railway and DATABASE_URL is set.');
    } else {
      console.error('⚠️  Error creating default admin:', error.message);
    }
    // Don't fail server startup if admin creation fails
  }
}

// Catch unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  // Don't exit, just log
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately, let the server try to handle it
});

// Start server and create default admin
(async () => {
  try {
    // Ensure default admin exists
    await ensureDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔐 Default Admin Login:`);
      console.log(`   Email: admin@ratemyra.com`);
      console.log(`   Password: admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
