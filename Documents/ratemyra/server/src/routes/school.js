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
    
    const where = q ? {
      name: { contains: q, mode: 'insensitive' }
    } : {};
    
    const schools = await prisma.school.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { ras: true },
        },
      },
      take: q ? 20 : 1000, // Limit results when searching
    });

    // Always return an array, even if empty
    res.json(schools || []);
  } catch (error) {
    console.error('Error fetching schools:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P1001') {
      return res.status(503).json({ error: 'Database connection failed. Please check database configuration.' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate entry' });
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
