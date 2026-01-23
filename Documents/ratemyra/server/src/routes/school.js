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
    const searchTerm = q ? q.trim() : '';
    
    // Try case-insensitive search, fallback to case-sensitive if needed
    let schools;
    const queryOptions = {
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { ras: true },
        },
      },
      take: searchTerm ? 20 : 1000,
    };
    
    if (searchTerm) {
      // Try case-insensitive first
      try {
        schools = await prisma.school.findMany({
          where: {
            name: { contains: searchTerm, mode: 'insensitive' }
          },
          ...queryOptions,
        });
      } catch (insensitiveError) {
        console.error('Case-insensitive search failed:', insensitiveError.message);
        // Fallback to case-sensitive
        try {
          schools = await prisma.school.findMany({
            where: {
              name: { contains: searchTerm }
            },
            ...queryOptions,
          });
        } catch (fallbackError) {
          console.error('Case-sensitive fallback also failed:', fallbackError.message);
          throw insensitiveError; // Throw original error
        }
      }
    } else {
      // No search term, get all schools
      schools = await prisma.school.findMany(queryOptions);
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
