import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Error handling middleware (must be last)
app.use(errorHandler);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Path relative to server directory: go up to root, then to client/dist
  const clientPath = path.join(__dirname, '../client/dist');
  
  // Check if client/dist exists and serve static files
  import('fs').then((fs) => {
    if (fs.default.existsSync(clientPath)) {
      console.log(`📦 Serving static files from: ${clientPath}`);
      app.use(express.static(clientPath));
      
      // Serve React app for all other routes (SPA routing)
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
      });
    } else {
      console.warn(`⚠️  Client dist not found at: ${clientPath}`);
      console.warn('   Make sure frontend is built during deployment');
      // Fallback: serve a simple message
      app.get('/', (req, res) => {
        res.send(`
          <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h1>RateMyRA Backend Running</h1>
              <p>Frontend not built. Check build logs.</p>
              <p>API is available at: <a href="/api/health">/api/health</a></p>
            </body>
          </html>
        `);
      });
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          res.status(404).json({ error: 'API route not found' });
        } else {
          res.status(404).send('Frontend not built. Check deployment logs.');
        }
      });
    }
  });
} else {
  // 404 handler for development
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
