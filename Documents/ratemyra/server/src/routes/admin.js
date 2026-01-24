import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPrismaClient } from '../utils/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { deleteCache, cacheKeys } from '../utils/cache.js';

const router = express.Router();
const prisma = getPrismaClient();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get admin dashboard stats
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const [
      totalRAs,
      totalReviews,
      activeReviews,
      flaggedReviews,
      hiddenReviews,
      totalSchools,
      recentReviews,
      recentRAs,
    ] = await Promise.all([
      prisma.rA.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'ACTIVE' } }),
      prisma.review.count({ where: { status: 'FLAGGED' } }),
      prisma.review.count({ where: { status: 'HIDDEN' } }),
      prisma.school.count(),
      prisma.review.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          ra: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.rA.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          school: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    res.json({
      stats: {
        totalRAs,
        totalReviews,
        activeReviews,
        flaggedReviews,
        hiddenReviews,
        totalSchools,
      },
      recentReviews,
      recentRAs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/reviews
 * Get all reviews with filters and pagination
 */
router.get('/reviews', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { page = 1, limit = 50, status, raId } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (raId) {
      where.raId = raId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          ra: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/reviews/:id/status
 * Update review status
 */
router.patch(
  '/reviews/:id/status',
  [
    body('status').isIn(['ACTIVE', 'FLAGGED', 'HIDDEN', 'REMOVED']).withMessage('Invalid status'),
  ],
  async (req, res, next) => {
    try {
      if (!prisma) {
        return res.status(503).json({ error: 'Database not available' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      const review = await prisma.review.findUnique({
        where: { id },
        include: { ra: true },
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: { status: status.toUpperCase() },
      });

      // Invalidate cache for this RA
      await deleteCache(cacheKeys.ra(review.raId));
      await deleteCache(cacheKeys.raReviews(review.raId));

      res.json({
        review: updatedReview,
        message: `Review status updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/admin/reviews/:id
 * Permanently delete a review
 */
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: { ra: true },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const raId = review.raId;

    await prisma.review.delete({
      where: { id },
    });

    // Invalidate cache
    await deleteCache(cacheKeys.ra(raId));
    await deleteCache(cacheKeys.raReviews(raId));

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/ras
 * Get all RAs with filters
 */
router.get('/ras', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { page = 1, limit = 50, schoolId, search } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ras, total] = await Promise.all([
      prisma.rA.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          school: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.rA.count({ where }),
    ]);

    res.json({
      ras,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/ras/:id
 * Delete an RA (and all their reviews)
 */
router.delete('/ras/:id', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    const ra = await prisma.rA.findUnique({
      where: { id },
    });

    if (!ra) {
      return res.status(404).json({ error: 'RA not found' });
    }

    await prisma.rA.delete({
      where: { id },
    });

    // Invalidate search cache
    await deleteCache(cacheKeys.search('*', ra.schoolId));

    res.json({ message: 'RA deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/ras/:id
 * Update RA information
 */
router.patch(
  '/ras/:id',
  [
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('dorm').optional().trim().isLength({ max: 100 }),
    body('floor').optional().trim().isLength({ max: 50 }),
    body('schoolId').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      if (!prisma) {
        return res.status(503).json({ error: 'Database not available' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { firstName, lastName, dorm, floor, schoolId } = req.body;

      const ra = await prisma.rA.findUnique({
        where: { id },
      });

      if (!ra) {
        return res.status(404).json({ error: 'RA not found' });
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (dorm !== undefined) updateData.dorm = dorm?.trim() || null;
      if (floor !== undefined) updateData.floor = floor?.trim() || null;
      if (schoolId !== undefined) updateData.schoolId = schoolId;

      const updatedRA = await prisma.rA.update({
        where: { id },
        data: updateData,
        include: {
          school: true,
        },
      });

      // Invalidate cache
      await deleteCache(cacheKeys.ra(id));
      await deleteCache(cacheKeys.search('*', updatedRA.schoolId));

      res.json({
        ra: updatedRA,
        message: 'RA updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/schools
 * Get all schools
 */
router.get('/schools', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { ras: true },
        },
      },
    });

    res.json(schools);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/seed-schools
 * Seed the database with schools (admin only)
 */
router.post('/seed-schools', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Import and run seed function
    const { seedSchools } = await import('../../scripts/seed-schools.js');
    
    // Run the seed function with the existing prisma instance
    const result = await seedSchools(prisma);
    
    res.json({
      success: true,
      message: 'Schools seeded successfully',
      created: result.created,
      skipped: result.skipped,
      total: result.total
    });
  } catch (error) {
    console.error('Error seeding schools:', error);
    next(error);
  }
});

/**
 * POST /api/admin/help-request
 * Submit a help request from admin dashboard
 */
router.post('/help-request', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('category').optional().isIn(['general', 'technical', 'feature', 'bug', 'account', 'other']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, subject, message, category } = req.body;

    // Log the help request (in production, you might want to store this in a database or send via email)
    console.log('📧 Help Request Received:');
    console.log('   From:', email);
    console.log('   Category:', category || 'general');
    console.log('   Subject:', subject);
    console.log('   Message:', message);
    console.log('   Timestamp:', new Date().toISOString());

    // TODO: In the future, you could:
    // 1. Store help requests in a database table
    // 2. Send email notification to support team
    // 3. Create a ticket in a support system
    // 4. Send auto-reply to the user

    res.json({
      success: true,
      message: 'Help request submitted successfully. We will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
