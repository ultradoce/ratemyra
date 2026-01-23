import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/schools
 * List all schools (with optional search)
 */
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    // Handle case where Prisma might not be initialized or database not connected
    if (!prisma) {
      console.error('Prisma client not initialized');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    // Build where clause
    const where = q && q.trim() ? {
      name: { contains: q.trim(), mode: 'insensitive' }
    } : {};
    
    let schools;
    try {
      schools = await prisma.school.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { ras: true },
          },
        },
        take: q ? 20 : 1000, // Limit results when searching
      });
    } catch (queryError) {
      // If case-insensitive fails, try case-sensitive
      if (queryError.message && queryError.message.includes('insensitive')) {
        console.log('Case-insensitive search failed, retrying with case-sensitive...');
        const fallbackWhere = q && q.trim() ? {
          name: { contains: q.trim() }
        } : {};
        
        schools = await prisma.school.findMany({
          where: fallbackWhere,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { ras: true },
            },
          },
          take: q ? 20 : 1000,
        });
      } else {
        throw queryError; // Re-throw if it's a different error
      }
    }

    // Always return an array, even if empty
    res.json(schools || []);
  } catch (error) {
    console.error('Error fetching schools:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error meta:', error.meta);
    
    // Handle specific Prisma errors
    if (error.code === 'P1001') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please check DATABASE_URL configuration.'
      });
    }
    if (error.code === 'P1012') {
      return res.status(500).json({ 
        error: 'Database configuration error',
        message: 'Database URL not found or invalid. Please check DATABASE_URL environment variable.'
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    
    // If it's a query error, try without case-insensitive mode
    if (q && error.message && error.message.includes('insensitive')) {
      try {
        console.log('Retrying search without case-insensitive mode...');
        const schools = await prisma.school.findMany({
          where: {
            name: { contains: q.trim() }
          },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { ras: true },
            },
          },
          take: 20,
        });
        return res.json(schools || []);
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
      }
    }
    
    // Generic error response
    next(error);
  }
});

/**
 * GET /api/schools/:id
 * Get school details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ras: true },
        },
      },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/schools
 * Create a new school
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, domain, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    const school = await prisma.school.create({
      data: {
        name,
        domain,
        location,
      },
    });

    res.status(201).json(school);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'School already exists' });
    }
    next(error);
  }
});

export default router;
