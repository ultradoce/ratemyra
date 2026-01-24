import jwt from 'jsonwebtoken';
import { getPrismaClient } from '../utils/prisma.js';

// Validate JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set. Using default secret (INSECURE - set JWT_SECRET in Railway variables)');
}

/**
 * Middleware to verify JWT token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get Prisma client
    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Verify user still exists and get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}
