import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
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
  // Path relative to server/src directory: go up to server, then to client/dist
  const clientPath = path.join(__dirname, '../client/dist');
  const absolutePath = path.resolve(clientPath);
  
  console.log(`🔍 Looking for client dist at: ${absolutePath}`);
  console.log(`   __dirname: ${__dirname}`);
  console.log(`   Current working directory: ${process.cwd()}`);
  
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
