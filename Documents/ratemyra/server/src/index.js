import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import { getPrismaClient } from './utils/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import raRoutes from './routes/ra.js';
import reviewRoutes from './routes/review.js';
import schoolRoutes from './routes/school.js';
import searchRoutes from './routes/search.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import helpRoutes from './routes/help.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const prisma = getPrismaClient();
const PORT = process.env.PORT || 3001;

// Log environment info for debugging
console.log('🔍 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   PORT:', PORT);
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.substring(0, 20)}...)` : 'NOT SET');
console.log('   Prisma client:', prisma ? 'INITIALIZED' : 'NULL');

if (!prisma) {
  console.warn('⚠️  DATABASE_URL not set. Database features will be disabled.');
  console.warn('   Add PostgreSQL database in Railway to enable database features.');
  console.warn('   If PostgreSQL is added, make sure it\'s in the same project and linked to this service.');
}

// Middleware
// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS resources
}));

// CORS configuration - allow custom domain and Railway domain
const allowedOrigins = [
  'https://ratemyra.com',
  'https://www.ratemyra.com',
  process.env.RAILWAY_PUBLIC_DOMAIN, // Railway's auto-generated domain
  process.env.CUSTOM_DOMAIN, // Custom domain from env
].filter(Boolean); // Remove undefined values

// Add localhost for development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all in production for now, can be restricted later
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// SEO routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /login

Sitemap: https://ratemyra.com/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ratemyra.com/</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ratemyra.com/search</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ratemyra.com/add-ra</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://ratemyra.com/guidelines</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://ratemyra.com/privacy</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://ratemyra.com/terms</loc>
    <lastmod>2026-01-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`);
});

// Health check - MUST return 200 for Railway to consider service healthy
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    server: 'running'
  };

  if (prisma) {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      health.database = 'connected';
    } catch (error) {
      // Even if database has issues, return 200 - server is running
      health.database = 'error';
      health.databaseError = error.message;
      health.databaseCode = error.code;
      // If tables don't exist, suggest setup endpoint
      if (error.code === 'P2021') {
        health.database = 'tables_missing';
        health.setupEndpoint = '/api/setup';
      }
    }
  } else {
    health.database = 'not_configured';
    health.databaseUrlSet = !!process.env.DATABASE_URL;
  }

  // CRITICAL: Always return 200 for health check
  // Railway uses this to determine if service is healthy
  // Database issues are reported in response body, not status code
  res.status(200).json(health);
});

// Setup endpoint - runs migrations and seeds schools (one-time setup)
// Supports both GET (easy browser access) and POST
const setupHandler = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'DATABASE_URL is not set. Please add PostgreSQL database in Railway.'
      });
    }

    const results = {
      migrations: { success: false, message: '' },
      seeding: { success: false, message: '', created: 0, skipped: 0 },
      cleanup: { success: false, message: '' }
    };

    // Step 1: Run migrations
    try {
      console.log('🔄 Running database migrations...');
      const serverDir = path.join(__dirname, '..');
      console.log('   Working directory:', serverDir);
      console.log('   DATABASE_URL set:', !!process.env.DATABASE_URL);
      
      let migrationOutput;
      try {
        // First try migrate deploy (for existing migrations)
        migrationOutput = execSync('npx prisma migrate deploy', { 
          cwd: serverDir,
          encoding: 'utf8',
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
        });
        
        // Check if output indicates no migrations exist
        const outputStr = migrationOutput.toString();
        if (outputStr.includes('No migration found') || outputStr.includes('No pending migrations')) {
          console.log('⚠️  No migrations found, using db push to sync schema...');
          migrationOutput = execSync('npx prisma db push --accept-data-loss', { 
            cwd: serverDir,
            encoding: 'utf8',
            stdio: 'pipe',
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
          });
          console.log('✅ Schema synced with db push');
        } else {
          console.log('✅ Migrations completed');
        }
      } catch (deployError) {
        const errorMsg = deployError.stderr?.toString() || deployError.message || '';
        // If no migrations exist, use db push to sync schema
        if (errorMsg.includes('No migration found') || errorMsg.includes('No pending migrations')) {
          console.log('⚠️  No migrations found, using db push to sync schema...');
          migrationOutput = execSync('npx prisma db push --accept-data-loss', { 
            cwd: serverDir,
            encoding: 'utf8',
            stdio: 'pipe',
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
          });
          console.log('✅ Schema synced with db push');
        } else {
          throw deployError;
        }
      }
      
      const outputPreview = migrationOutput.substring(0, 1000);
      console.log('Migration output:', outputPreview);
      
      results.migrations.success = true;
      results.migrations.message = 'Migrations completed successfully';
      results.migrations.output = outputPreview;
    } catch (migrationError) {
      console.error('❌ Migration error:', migrationError.message);
      console.error('   Error code:', migrationError.status);
      console.error('   Stderr:', migrationError.stderr?.toString().substring(0, 500));
      console.error('   Stdout:', migrationError.stdout?.toString().substring(0, 500));
      
      // Check if error is because migrations are already applied
      const errorMsg = migrationError.message || migrationError.stderr?.toString() || '';
      if (errorMsg.includes('already applied') || errorMsg.includes('No pending migrations') || errorMsg.includes('already in the database')) {
        results.migrations.success = true;
        results.migrations.message = 'Migrations already applied';
      } else {
        results.migrations.message = migrationError.message || 'Migration failed';
        results.migrations.error = errorMsg.substring(0, 500);
      }
    }

    // Step 2: Seed schools
    try {
      console.log('🌱 Seeding schools...');
      const { seedSchools } = await import('../scripts/seed-schools.js');
      const seedResult = await seedSchools(prisma);
      results.seeding.success = true;
      results.seeding.created = seedResult.created;
      results.seeding.skipped = seedResult.skipped;
      results.seeding.message = `Seeded ${seedResult.created} schools successfully`;
    } catch (seedError) {
      console.error('❌ Seeding error:', seedError);
      results.seeding.message = seedError.message;
    }

    // Step 3: Create admin account
    try {
      console.log('👤 Ensuring admin account exists...');
      await ensureDefaultAdmin();
      results.admin = { success: true, message: 'Admin account ready' };
    } catch (adminError) {
      console.error('❌ Admin creation error:', adminError);
      results.admin = { success: false, message: adminError.message };
    }

    // Step 4: Clean up removed tags
    try {
      console.log('🧹 Cleaning up removed tags...');
      const REMOVED_TAGS = [
        'TOUGH_GRADER',
        'PARTICIPATION_MATTERS',
        'GROUP_WORK',
        'INDEPENDENT_WORK',
      ];

      // Get all reviews that have any of the removed tags
      const reviewsToUpdate = await prisma.review.findMany({
        where: {
          tags: {
            hasSome: REMOVED_TAGS,
          },
        },
        select: {
          id: true,
          tags: true,
          raId: true,
        },
      });

      let updatedCount = 0;
      let totalTagsRemoved = 0;

      // Update each review to remove the invalid tags
      for (const review of reviewsToUpdate) {
        const originalTags = [...review.tags];
        const cleanedTags = review.tags.filter(tag => !REMOVED_TAGS.includes(tag));
        
        if (cleanedTags.length !== originalTags.length) {
          const removedCount = originalTags.length - cleanedTags.length;
          totalTagsRemoved += removedCount;

          await prisma.review.update({
            where: { id: review.id },
            data: { tags: cleanedTags },
          });

          updatedCount++;
        }
      }

      // Delete tag statistics for removed tags
      let deletedStatsCount = 0;
      for (const tag of REMOVED_TAGS) {
        const result = await prisma.rATagStat.deleteMany({
          where: { tag },
        });
        deletedStatsCount += result.count;
      }

      results.cleanup.success = true;
      results.cleanup.message = `Cleaned up ${updatedCount} reviews, removed ${totalTagsRemoved} tags, deleted ${deletedStatsCount} tag stats`;
      results.cleanup.reviewsUpdated = updatedCount;
      results.cleanup.tagsRemoved = totalTagsRemoved;
      results.cleanup.tagStatsDeleted = deletedStatsCount;
      
      console.log(`✅ Tag cleanup completed: ${updatedCount} reviews updated, ${totalTagsRemoved} tags removed`);
    } catch (cleanupError) {
      console.error('❌ Tag cleanup error:', cleanupError);
      results.cleanup.message = cleanupError.message || 'Tag cleanup failed';
    }

    const allSuccess = results.migrations.success && results.seeding.success;
    res.status(allSuccess ? 200 : 207).json({
      success: allSuccess,
      message: 'Setup completed',
      results
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

app.get('/api/setup', setupHandler);
app.post('/api/setup', setupHandler);

// Routes
app.use('/api/ras', raRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help', helpRoutes);

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
  // Check if Prisma client is available
  if (!prisma) {
    console.log('⚠️  Database not available. Skipping admin account creation.');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET (but Prisma failed to initialize)' : 'NOT SET');
    console.log('   Add PostgreSQL database in Railway to enable admin account.');
    return;
  }

  try {
    const DEFAULT_ADMIN_EMAIL = 'admin@ratemyra.com';
    const DEFAULT_ADMIN_PASSWORD = 'admin123';
    
    console.log('🔌 Testing database connection...');
    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
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
    console.error('❌ Error in ensureDefaultAdmin:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    if (error.code === 'P1001' || error.code === 'P1012') {
      console.error('⚠️  Database connection error. Cannot create admin account.');
      console.error('   Make sure PostgreSQL is added to Railway and DATABASE_URL is set.');
      console.error('   DATABASE_URL present:', !!process.env.DATABASE_URL);
    } else if (error.code === 'P1000') {
      console.error('⚠️  Authentication failed. Check DATABASE_URL credentials.');
    } else if (error.code === 'P1017') {
      console.error('⚠️  Server closed connection. Database may be restarting.');
    } else if (error.code === 'P2021') {
      console.error('⚠️  Database tables do not exist. Migrations need to be run.');
      console.error('   Visit /api/setup to run migrations and create tables.');
      console.error('   Or run: npx prisma migrate deploy');
    } else {
      console.error('⚠️  Error creating default admin:', error.message);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
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

// Start server immediately - don't wait for anything
console.log('🚀 Starting server...');
console.log(`   PORT: ${PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// Start server FIRST - before any async operations
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`📋 Setup endpoint: http://0.0.0.0:${PORT}/api/setup`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Port ${PORT} is already in use`);
  }
});

// Ensure default admin exists (non-blocking - server already started)
setTimeout(() => {
  ensureDefaultAdmin().catch(err => {
    if (err.code === 'P2021') {
      console.log('ℹ️  Database tables not created yet. Visit /api/setup to create them.');
    } else {
      console.error('⚠️  Admin creation failed, but server will continue:', err.message);
    }
  });
}, 1000); // Wait 1 second after server starts

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

export default app;
