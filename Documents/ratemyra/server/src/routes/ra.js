import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getPrismaClient } from '../utils/prisma.js';
import { calculateWeightedRating, getRatingDistribution, calculateAverageDifficulty, calculateWouldTakeAgainPercentage } from '../utils/rating.js';
import { getCache, setCache, deleteCache, cacheKeys } from '../utils/cache.js';
import { findPotentialDuplicates } from '../utils/duplicateDetection.js';
import { hashIP, getClientIP } from '../utils/abusePrevention.js';

const router = express.Router();
const prisma = getPrismaClient();

// Rate limiting: 10 RA submissions per hour per IP
const createRARateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many RA submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/ras/trending
 * Get trending/popular RAs across all schools or for a specific school
 * MUST be defined before /:id route to avoid route conflicts
 */
router.get('/trending', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { schoolId, limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    // Get RAs with most reviews and highest ratings
    const ras = await prisma.rA.findMany({
      where,
      include: {
        school: true,
        reviews: {
          where: { status: 'ACTIVE' },
        },
      },
      take: limitNum * 2, // Get more to rank
    });

    // Calculate scores and rank
    const rasWithScores = await Promise.all(
      ras.map(async (ra) => {
        const reviews = ra.reviews;
        const rating = calculateWeightedRating(reviews);
        const reviewCount = reviews.length;
        const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);

        // Ranking algorithm: balance between rating and review count
        const ratingScore = rating ? rating / 5 : 0; // Normalize to 0-1
        const volumeScore = Math.log(reviewCount + 1) / Math.log(100); // Log scale
        const score = ratingScore * 0.6 + volumeScore * 0.4;

        return {
          id: ra.id,
          firstName: ra.firstName,
          lastName: ra.lastName,
          school: ra.school,
          dorm: ra.dorm,
          floor: ra.floor,
          rating,
          totalReviews: reviewCount,
          wouldTakeAgainPercentage,
          score,
        };
      })
    );

    // Sort by score and limit
    rasWithScores.sort((a, b) => b.score - a.score);
    const results = rasWithScores.slice(0, limitNum).map(({ score, ...rest }) => rest);

    res.json({
      results,
      total: results.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ras/:id
 * Get RA profile with aggregated stats
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    
    // Try cache first
    const cacheKey = cacheKeys.ra(id);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const ra = await prisma.rA.findUnique({
      where: { id },
      include: {
        school: true,
        reviews: {
          where: { status: 'ACTIVE' },
          orderBy: { timestamp: 'desc' },
          take: 50, // Limit for performance
        },
        tagStats: {
          orderBy: { count: 'desc' },
        },
      },
    });

    if (!ra) {
      return res.status(404).json({ error: 'RA not found' });
    }

    // Calculate aggregated stats
    const activeReviews = ra.reviews.filter(r => r.status === 'ACTIVE');
    const weightedRating = calculateWeightedRating(activeReviews);
    const ratingDistribution = getRatingDistribution(activeReviews);
    const averageDifficulty = calculateAverageDifficulty(activeReviews);
    const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(activeReviews);
    
    // Format tag stats with display names
    const tagStats = ra.tagStats.map(stat => ({
      tag: stat.tag,
      count: stat.count,
    }));

    const response = {
      id: ra.id,
      firstName: ra.firstName,
      lastName: ra.lastName,
      school: ra.school,
      dorm: ra.dorm,
      floor: ra.floor,
      rating: weightedRating,
      totalReviews: activeReviews.length,
      ratingDistribution,
      averageDifficulty,
      wouldTakeAgainPercentage,
      tagStats,
      recentReviews: activeReviews.slice(0, 10), // Most recent 10
    };

    // Cache for 5 minutes
    await setCache(cacheKey, response, 300);
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ras
 * List RAs with optional filters
 */
router.get('/', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { schoolId, dorm, search } = req.query;
    
    const where = {};
    
    if (schoolId) {
      where.schoolId = schoolId;
    }
    
    if (dorm) {
      where.dorm = { contains: dorm, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const ras = await prisma.rA.findMany({
      where,
      include: {
        school: true,
        _count: {
          select: { reviews: { where: { status: 'ACTIVE' } } },
        },
      },
      take: 50,
    });

    // Calculate ratings for each RA
    const rasWithRatings = await Promise.all(
      ras.map(async (ra) => {
        const reviews = await prisma.review.findMany({
          where: {
            raId: ra.id,
            status: 'ACTIVE',
          },
        });
        
        const rating = calculateWeightedRating(reviews);
        
        return {
          id: ra.id,
          firstName: ra.firstName,
          lastName: ra.lastName,
          school: ra.school,
          dorm: ra.dorm,
          floor: ra.floor,
          rating,
          totalReviews: reviews.length,
        };
      })
    );

    res.json(rasWithRatings);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ras
 * Create a new RA (submitted by students)
 */
router.post(
  '/',
  createRARateLimit,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }).withMessage('First name must be under 50 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }).withMessage('Last name must be under 50 characters'),
    body('schoolId').notEmpty().withMessage('School is required'),
    body('dorm').optional().trim().isLength({ max: 100 }).withMessage('Dorm name must be under 100 characters'),
    body('floor').optional().trim().isLength({ max: 50 }).withMessage('Floor must be under 50 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, schoolId, dorm, floor } = req.body;

      // Verify school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });

      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      // Check for potential duplicates (unless force create is requested)
      const forceCreate = req.headers['x-force-create'] === 'true';
      
      if (!forceCreate) {
        const duplicates = await findPotentialDuplicates(prisma, firstName, lastName, schoolId);
        
        if (duplicates.length > 0) {
          const exactMatch = duplicates.find(
            d => d.firstName.toLowerCase() === firstName.toLowerCase() &&
                 d.lastName.toLowerCase() === lastName.toLowerCase()
          );

          if (exactMatch) {
            return res.status(409).json({
              error: 'RA already exists',
              duplicate: {
                id: exactMatch.id,
                firstName: exactMatch.firstName,
                lastName: exactMatch.lastName,
              },
              message: 'An RA with this name already exists at this school.',
            });
          }

          // If high similarity but not exact, return potential duplicates for user to confirm
          if (duplicates[0].similarity >= 0.9) {
            return res.status(409).json({
              error: 'Potential duplicate found',
              potentialDuplicates: duplicates.slice(0, 3).map(d => ({
                id: d.id,
                firstName: d.firstName,
                lastName: d.lastName,
                dorm: d.dorm,
                floor: d.floor,
                similarity: Math.round(d.similarity * 100),
              })),
              message: 'An RA with a similar name already exists. Please verify this is not the same person.',
            });
          }
        }
      }

      // Create the RA
      const ra = await prisma.rA.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          schoolId,
          dorm: dorm?.trim() || null,
          floor: floor?.trim() || null,
        },
        include: {
          school: true,
        },
      });

      // Invalidate search cache
      await deleteCache(cacheKeys.search('*', schoolId));

      res.status(201).json({
        id: ra.id,
        firstName: ra.firstName,
        lastName: ra.lastName,
        school: ra.school,
        dorm: ra.dorm,
        floor: ra.floor,
        message: 'RA added successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
