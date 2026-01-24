import express from 'express';
import { getPrismaClient } from '../utils/prisma.js';

const router = express.Router();
const prisma = getPrismaClient();

/**
 * GET /api/schools/test
 * Test endpoint to check if schools table exists and database is connected
 */
router.get('/test', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        message: 'DATABASE_URL is not set. Add PostgreSQL database in Railway.'
      });
    }

    // Simple test query
    const count = await prisma.school.count();
    const sampleSchools = await prisma.school.findMany({
      take: 5,
      select: { id: true, name: true, location: true }
    });
    res.json({ 
      success: true, 
      message: 'Schools table accessible',
      count,
      sampleSchools: sampleSchools || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});

/**
 * GET /api/schools
 * List all schools (with optional search)
 */
router.get('/', async (req, res, next) => {
  const { q, limit } = req.query;
  
  try {
    console.log('GET /api/schools - Query params:', { q, limit });
    
    // Handle case where Prisma might not be initialized or database not connected
    if (!prisma) {
      console.error('❌ Prisma client not initialized');
      console.error('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
      console.error('   If DATABASE_URL is set, check Railway logs for Prisma initialization errors');
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'Database connection is not configured. Please check Railway logs for details.',
        debug: process.env.NODE_ENV === 'development' ? {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0
        } : undefined
      });
    }
    
    const searchTerm = q ? q.trim() : '';
    const resultLimit = limit ? parseInt(limit, 10) : (searchTerm ? 20 : 50);
    
    console.log('Search params:', { searchTerm, resultLimit });
    
    let schools = [];
    
    try {
      if (searchTerm) {
        // Search by name or location
        console.log('Searching schools with term:', searchTerm);
        schools = await prisma.school.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm } },
              { location: { contains: searchTerm } }
            ]
          },
          orderBy: { name: 'asc' },
          take: resultLimit,
          select: {
            id: true,
            name: true,
            location: true,
            domain: true,
          },
        });
        console.log(`Found ${schools.length} schools matching "${searchTerm}"`);
      } else {
        // No search term, show popular schools (ordered by name for now)
        console.log('Fetching all schools (limit:', resultLimit, ')');
        schools = await prisma.school.findMany({
          orderBy: { name: 'asc' },
          take: resultLimit,
          select: {
            id: true,
            name: true,
            location: true,
            domain: true,
          },
        });
        console.log(`Found ${schools.length} schools total`);
      }
      
      // Try to get RA counts, but don't fail if it doesn't work
      try {
        const schoolsWithCounts = await Promise.all(
          schools.map(async (school) => {
            try {
              const count = await prisma.rA.count({
                where: { schoolId: school.id }
              });
              return { ...school, _count: { ras: count } };
            } catch (err) {
              console.warn(`Failed to count RAs for school ${school.id}:`, err.message);
              return { ...school, _count: { ras: 0 } };
            }
          })
        );
        schools = schoolsWithCounts;
      } catch (err) {
        console.warn('Failed to get RA counts, using defaults:', err.message);
        // If counting fails, just set to 0
        schools = schools.map(school => ({ ...school, _count: { ras: 0 } }));
      }
      
    } catch (queryError) {
      console.error('School query error:', queryError);
      console.error('Error code:', queryError.code);
      console.error('Error message:', queryError.message);
      console.error('Error stack:', queryError.stack);
      
      // Return empty array instead of crashing
      if (queryError.code === 'P1001' || queryError.code === 'P1012') {
        return res.status(503).json({ 
          error: 'Database connection error',
          message: 'Unable to connect to database'
        });
      }
      
      // For other errors, return empty array to prevent crash
      console.error('Query failed, returning empty array to prevent crash');
      return res.json([]);
    }

    console.log(`Returning ${schools.length} schools`);
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
    if (q && prisma && error.message && error.message.includes('insensitive')) {
      try {
        console.log('Retrying search without case-insensitive mode...');
        const schools = await prisma.school.findMany({
          where: {
            name: { contains: q.trim() }
          },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            location: true,
            domain: true,
          },
          take: 20,
        });
        // Add _count manually
        const schoolsWithCounts = schools.map(school => ({ ...school, _count: { ras: 0 } }));
        return res.json(schoolsWithCounts || []);
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
      }
    }
    
    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Failed to fetch schools',
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        meta: error.meta
      })
    });
  }
});

/**
 * GET /api/schools/:id
 * Get school details
 * NOTE: This must come after /test route
 */
router.get('/:id', async (req, res, next) => {
  // Don't treat 'test' as an ID
  if (req.params.id === 'test') {
    return next();
  }
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

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
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

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
