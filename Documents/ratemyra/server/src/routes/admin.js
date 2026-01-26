import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPrismaClient } from '../utils/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { deleteCache, cacheKeys } from '../utils/cache.js';

const router = express.Router();
const prisma = getPrismaClient();

// Track-view endpoint is public (no auth required)
router.post('/track-view', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { pageType, pageId, state, country, ipHash, userAgent, referrer } = req.body;

    // Validate required fields
    if (!pageType) {
      return res.status(400).json({ error: 'pageType is required' });
    }

    // Create page view record (handle case where PageView table doesn't exist yet)
    try {
      await prisma.pageView.create({
        data: {
          pageType,
          pageId: pageId || null,
          state: state || null,
          country: country || null,
          ipHash: ipHash || 'unknown',
          userAgent: userAgent || null,
          referrer: referrer || null,
        },
      });
      res.json({ success: true });
    } catch (error) {
      // If PageView table doesn't exist, silently fail (migration hasn't run yet)
      if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('PageView')) {
        console.log('PageView table not found, skipping view tracking');
        return res.json({ success: false, message: 'PageView table not available' });
      }
      throw error;
    }
  } catch (error) {
    // Don't fail requests if tracking fails
    console.error('Failed to track view:', error);
    res.json({ success: false });
  }
});

// All other admin routes require authentication and admin role
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
      unreadHelpMessages,
      recentReviews,
      recentRAs,
    ] = await Promise.all([
      prisma.rA.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'ACTIVE' } }),
      prisma.review.count({ where: { status: 'FLAGGED' } }),
      prisma.review.count({ where: { status: 'HIDDEN' } }),
      prisma.school.count(),
      prisma.helpMessage.count({ where: { status: 'UNREAD' } }),
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
        unreadHelpMessages,
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
 * POST /api/admin/cleanup-tags
 * Clean up removed tags from reviews and tag statistics
 */
router.post('/cleanup-tags', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const REMOVED_TAGS = [
      'TOUGH_GRADER',
      'PARTICIPATION_MATTERS',
      'GROUP_WORK',
      'INDEPENDENT_WORK',
    ];

    console.log('🧹 Starting tag cleanup...');
    console.log('Removing tags:', REMOVED_TAGS.join(', '));

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

    console.log(`Found ${reviewsToUpdate.length} reviews with removed tags`);

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

        // Invalidate cache for this RA
        await deleteCache(cacheKeys.ra(review.raId));
        await deleteCache(cacheKeys.raReviews(review.raId));

        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} reviews`);
    console.log(`✅ Removed ${totalTagsRemoved} invalid tag instances`);

    // Delete tag statistics for removed tags
    console.log('🧹 Cleaning up tag statistics...');
    
    let deletedStatsCount = 0;
    for (const tag of REMOVED_TAGS) {
      const result = await prisma.rATagStat.deleteMany({
        where: { tag },
      });
      deletedStatsCount += result.count;
      if (result.count > 0) {
        console.log(`  Deleted ${result.count} tag stats for ${tag}`);
      }
    }

    console.log(`✅ Deleted ${deletedStatsCount} tag statistics entries`);

    res.json({
      success: true,
      message: 'Tag cleanup completed successfully',
      summary: {
        reviewsUpdated: updatedCount,
        tagsRemoved: totalTagsRemoved,
        tagStatsDeleted: deletedStatsCount,
      },
    });
  } catch (error) {
    console.error('❌ Error during tag cleanup:', error);
    next(error);
  }
});

/**
 * POST /api/admin/remove-fake-data
 * Remove all fake data (RAs and reviews with invisible markers)
 */
router.post('/remove-fake-data', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Invisible markers
    const FAKE_DORM_MARKER = '\u200C'; // Zero-width non-joiner
    const FAKE_REVIEW_MARKER = '\u200B'; // Zero-width space

    console.log('🗑️  Starting to remove fake data...');

    // Step 1: Find all fake RAs
    const fakeRAs = await prisma.rA.findMany({
      where: {
        dorm: {
          startsWith: FAKE_DORM_MARKER,
        },
      },
      select: {
        id: true,
      },
    });

    console.log(`   Found ${fakeRAs.length} fake RAs`);

    // Step 2: Delete fake reviews first
    const reviewsDeleted = await prisma.review.deleteMany({
      where: {
        textBody: {
          startsWith: FAKE_REVIEW_MARKER,
        },
      },
    });

    console.log(`   Deleted ${reviewsDeleted.count} fake reviews`);

    // Step 3: Delete fake RAs
    const fakeRAIds = fakeRAs.map(ra => ra.id);
    const rasDeleted = await prisma.rA.deleteMany({
      where: {
        id: {
          in: fakeRAIds,
        },
      },
    });

    console.log(`   Deleted ${rasDeleted.count} fake RAs`);

    // Step 4: Clean up orphaned tag stats
    const allTagStats = await prisma.rATagStat.findMany({
      select: {
        id: true,
        raId: true,
      },
    });

    const existingRAIds = new Set(
      (await prisma.rA.findMany({ select: { id: true } })).map(ra => ra.id)
    );

    const orphanedTagStats = allTagStats.filter(stat => !existingRAIds.has(stat.raId));
    
    let tagStatsDeleted = 0;
    if (orphanedTagStats.length > 0) {
      const deletedTagStats = await prisma.rATagStat.deleteMany({
        where: {
          id: {
            in: orphanedTagStats.map(stat => stat.id),
          },
        },
      });
      tagStatsDeleted = deletedTagStats.count;
    }

    // Invalidate all caches
    await deleteCache('*');

    res.json({
      success: true,
      message: 'Fake data removed successfully',
      summary: {
        rasRemoved: rasDeleted.count,
        reviewsRemoved: reviewsDeleted.count,
        tagStatsRemoved: tagStatsDeleted,
      },
    });
  } catch (error) {
    console.error('❌ Error removing fake data:', error);
    next(error);
  }
});

/**
 * GET /api/admin/fake-data-stats
 * Get count of fake data (for preview before deletion)
 */
router.get('/fake-data-stats', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const FAKE_DORM_MARKER = '\u200C';
    const FAKE_REVIEW_MARKER = '\u200B';

    const [fakeRAsCount, fakeReviewsCount] = await Promise.all([
      prisma.rA.count({
        where: {
          dorm: {
            startsWith: FAKE_DORM_MARKER,
          },
        },
      }),
      prisma.review.count({
        where: {
          textBody: {
            startsWith: FAKE_REVIEW_MARKER,
          },
        },
      }),
    ]);

    res.json({
      fakeRAs: fakeRAsCount,
      fakeReviews: fakeReviewsCount,
      hasFakeData: fakeRAsCount > 0 || fakeReviewsCount > 0,
    });
  } catch (error) {
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

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics
 */
router.get('/analytics', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Growth metrics
    const [
      rasCreated,
      reviewsCreated,
      totalRAs,
      totalReviews,
      reviewsBySchool,
      topRAs,
      growthData,
      viewsByState,
    ] = await Promise.all([
      // RAs created in period
      prisma.rA.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Reviews created in period
      prisma.review.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Total counts
      prisma.rA.count(),
      prisma.review.count({ where: { status: 'ACTIVE' } }),
      // Reviews by school
      prisma.rA.groupBy({
        by: ['schoolId'],
        _count: { reviews: true },
        where: {
          reviews: {
            some: { status: 'ACTIVE' },
          },
        },
      }),
      // Top RAs by review count
      prisma.rA.findMany({
        take: 10,
        include: {
          school: true,
          _count: {
            select: { reviews: { where: { status: 'ACTIVE' } } },
          },
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
      }),
      // Daily growth data (simplified - get counts per day)
      (async () => {
        try {
          const [ras, reviews] = await Promise.all([
            prisma.rA.findMany({
              where: { createdAt: { gte: startDate } },
              select: { createdAt: true },
            }),
            prisma.review.findMany({
              where: { 
                createdAt: { gte: startDate },
                status: 'ACTIVE',
              },
              select: { createdAt: true },
            }),
          ]);
          // Group by date
          const grouped = {};
          ras.forEach(ra => {
            const date = ra.createdAt.toISOString().split('T')[0];
            if (!grouped[date]) grouped[date] = { ras: 0, reviews: 0 };
            grouped[date].ras++;
          });
          reviews.forEach(review => {
            const date = review.createdAt.toISOString().split('T')[0];
            if (!grouped[date]) grouped[date] = { ras: 0, reviews: 0 };
            grouped[date].reviews++;
          });
          return Object.entries(grouped).map(([date, counts]) => ({
            date,
            ras: counts.ras,
            reviews: counts.reviews,
          })).sort((a, b) => a.date.localeCompare(b.date));
        } catch (err) {
          console.error('Error fetching growth data:', err);
          return [];
        }
      })(),
      // Views by state (handle case where PageView table doesn't exist yet)
      (async () => {
        try {
          return await prisma.pageView.groupBy({
            by: ['state'],
            _count: { id: true },
            where: {
              createdAt: { gte: startDate },
              state: { not: null },
            },
          });
        } catch (err) {
          // If PageView table doesn't exist yet, return empty array
          if (err.code === 'P2021' || err.message?.includes('does not exist') || err.message?.includes('PageView')) {
            console.log('PageView table not found, returning empty views data');
            return [];
          }
          throw err;
        }
      })(),
    ]);

    // Get school names for reviews by school
    const schoolIds = reviewsBySchool.map(item => item.schoolId);
    const schools = await prisma.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true, name: true },
    });
    const schoolMap = new Map(schools.map(s => [s.id, s.name]));

    const reviewsBySchoolFormatted = reviewsBySchool
      .map(item => ({
        schoolId: item.schoolId,
        schoolName: schoolMap.get(item.schoolId) || 'Unknown',
        reviewCount: item._count.reviews,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 20);

    // Format top RAs
    const topRAsFormatted = topRAs
      .filter(ra => ra._count.reviews > 0)
      .map(ra => ({
        id: ra.id,
        firstName: ra.firstName,
        lastName: ra.lastName,
        school: ra.school.name,
        reviewCount: ra._count.reviews,
      }));

    // Format views by state (handle case where viewsByState might be empty or undefined)
    const viewsByStateFormatted = (Array.isArray(viewsByState) ? viewsByState : [])
      .map(item => ({
        state: item.state,
        views: item._count.id,
      }))
      .sort((a, b) => b.views - a.views);

    res.json({
      period: days,
      growth: {
        rasCreated,
        reviewsCreated,
        totalRAs,
        totalReviews,
      },
      reviewsBySchool: reviewsBySchoolFormatted,
      topRAs: topRAsFormatted,
      growthData: Array.isArray(growthData) ? growthData : [],
      viewsByState: viewsByStateFormatted,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    next(error);
  }
});

export default router;
