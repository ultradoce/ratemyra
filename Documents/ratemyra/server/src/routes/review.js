import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getPrismaClient } from '../utils/prisma.js';
import { calculateOverallRating } from '../utils/rating.js';
import { hashIP, hashDeviceFingerprint, getClientIP, detectSimilarReviews } from '../utils/abusePrevention.js';
import { validateTags, updateTagStats, TAG_DISPLAY_NAMES } from '../utils/tags.js';
import { deleteCache, cacheKeys, getCache, setCache } from '../utils/cache.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = getPrismaClient();

// Rate limiting: 5 reviews per hour per IP
const reviewRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many reviews submitted. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/reviews
 * Submit a new review
 */
router.post(
  '/',
  reviewRateLimit,
  [
    body('raId').notEmpty().withMessage('RA ID is required'),
    body('ratingClarity').isInt({ min: 1, max: 5 }).withMessage('Clarity rating must be 1-5'),
    body('ratingHelpfulness').isInt({ min: 1, max: 5 }).withMessage('Helpfulness rating must be 1-5'),
    body('difficulty').isInt({ min: 1, max: 5 }).withMessage('Difficulty must be 1-5'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('textBody').optional().isString().isLength({ max: 2000 }).withMessage('Review text must be under 2000 characters'),
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

      const {
        raId,
        courseCode,
        ratingClarity,
        ratingHelpfulness,
        difficulty,
        wouldTakeAgain,
        tags = [],
        attendanceRequired = false,
        textBody,
      } = req.body;

      // Verify RA exists
      const ra = await prisma.rA.findUnique({
        where: { id: raId },
      });

      if (!ra) {
        return res.status(404).json({ error: 'RA not found' });
      }

      // Abuse prevention
      const clientIP = getClientIP(req);
      const ipHash = hashIP(clientIP);
      const deviceFingerprintHash = hashDeviceFingerprint(req, req.body);

      // Check for recent reviews from same IP for this RA (24 hours)
      const recentReviewsByIP = await prisma.review.findMany({
        where: {
          ipHash,
          raId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentReviewsByIP.length > 0) {
        return res.status(429).json({
          error: 'You have already submitted a review for this RA recently. Please wait 24 hours before submitting another review.',
        });
      }

      // Check for recent reviews from same device fingerprint for this RA (24 hours)
      if (deviceFingerprintHash) {
        const recentReviewsByDevice = await prisma.review.findMany({
          where: {
            deviceFingerprintHash,
            raId,
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (recentReviewsByDevice.length > 0) {
          return res.status(429).json({
            error: 'You have already submitted a review for this RA recently. Please wait 24 hours before submitting another review.',
          });
        }
      }

      // Check for any reviews from same IP + device combination for this RA (7 days)
      if (deviceFingerprintHash) {
        const recentReviewsByIPAndDevice = await prisma.review.findMany({
          where: {
            ipHash,
            deviceFingerprintHash,
            raId,
            timestamp: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        });

        if (recentReviewsByIPAndDevice.length > 0) {
          return res.status(429).json({
            error: 'You have already submitted a review for this RA. Each device can only submit one review per RA.',
          });
        }
      }

      // Check for excessive reviews from same IP across all RAs (prevent spam)
      const totalRecentReviewsByIP = await prisma.review.count({
        where: {
          ipHash,
          timestamp: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last 1 hour
          },
        },
      });

      if (totalRecentReviewsByIP >= 5) {
        return res.status(429).json({
          error: 'Too many reviews submitted from this location. Please try again later.',
        });
      }

      // Check for excessive reviews from same device across all RAs (prevent spam)
      if (deviceFingerprintHash) {
        const totalRecentReviewsByDevice = await prisma.review.count({
          where: {
            deviceFingerprintHash,
            timestamp: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Last 1 hour
            },
          },
        });

        if (totalRecentReviewsByDevice >= 5) {
          return res.status(429).json({
            error: 'Too many reviews submitted from this device. Please try again later.',
          });
        }

        // Check for reviews from same device across all RAs in last 24 hours
        const totalDailyReviewsByDevice = await prisma.review.count({
          where: {
            deviceFingerprintHash,
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (totalDailyReviewsByDevice >= 20) {
          return res.status(429).json({
            error: 'Daily review limit reached. Please try again tomorrow.',
          });
        }
      }

      // Check for similar reviews (duplicate detection)
      if (textBody) {
        const existingReviews = await prisma.review.findMany({
          where: {
            raId,
            status: 'ACTIVE',
          },
          select: { textBody: true },
        });

        const existingTexts = existingReviews.map(r => r.textBody).filter(Boolean);
        if (detectSimilarReviews(textBody, existingTexts)) {
          // Flag but don't reject - let moderation handle it
          console.warn(`Similar review detected for RA ${raId}`);
        }
      }

      // Calculate overall rating
      const ratingOverall = calculateOverallRating(ratingClarity, ratingHelpfulness);

      // Validate and clean tags
      const validTags = validateTags(tags);

      // Get userId if user is authenticated (optional - reviews can be anonymous)
      const userId = req.user?.id || null;

      // Create review
      const review = await prisma.review.create({
        data: {
          raId,
          userId, // Link to user if logged in (allows editing later)
          courseCode,
          ratingClarity,
          ratingHelpfulness,
          ratingOverall,
          difficulty,
          wouldTakeAgain: wouldTakeAgain !== undefined ? wouldTakeAgain : null,
          tags: validTags,
          attendanceRequired,
          textBody,
          ipHash,
          deviceFingerprintHash,
          status: 'ACTIVE',
        },
      });

      // Update tag statistics
      if (validTags.length > 0) {
        await updateTagStats(prisma, raId, validTags);
      }

      // Invalidate cache for this RA
      await deleteCache(cacheKeys.ra(raId));
      await deleteCache(cacheKeys.raReviews(raId));

      res.status(201).json({
        id: review.id,
        message: 'Review submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reviews/single/:id
 * Get a single review by ID
 */
router.get('/single/:id', authenticateToken, async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        ra: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only view your own reviews' });
    }

    res.json({ review });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reviews/:raId
 * Get reviews for a specific RA
 */
router.get('/:raId', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { raId } = req.params;
    const { page = 1, limit = 20, status = 'ACTIVE' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    // Try cache for first page
    const cacheKey = pageNum === 1 ? cacheKeys.raReviews(raId) : null;
    if (cacheKey) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          raId,
          status: status.toUpperCase(),
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          courseCode: true,
          ratingClarity: true,
          ratingHelpfulness: true,
          ratingOverall: true,
          difficulty: true,
          wouldTakeAgain: true,
          tags: true,
          helpfulCount: true,
          notHelpfulCount: true,
          userId: true,
          attendanceRequired: true,
          textBody: true,
          timestamp: true,
          // Don't expose IP hash or device fingerprint
        },
      }),
      prisma.review.count({
        where: {
          raId,
          status: status.toUpperCase(),
        },
      }),
    ]);

    const response = {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // Cache first page for 2 minutes
    if (cacheKey) {
      await setCache(cacheKey, response, 120);
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reviews/:id/flag
 * Flag a review for moderation
 */
router.post('/:id/flag', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update status to FLAGGED
    await prisma.review.update({
      where: { id },
      data: {
        status: 'FLAGGED',
      },
    });

    // In production, you'd log this to a moderation queue
    console.log(`Review ${id} flagged. Reason: ${reason || 'Not specified'}`);

    res.json({ message: 'Review flagged for moderation' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reviews/:id/like
 * Like or dislike a review (helpful/not helpful)
 */
router.post('/:id/like', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { isHelpful } = req.body; // true = helpful, false = not helpful

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: 'isHelpful must be a boolean' });
    }

    // Get user info if authenticated (optional)
    const userId = req.user?.id || null;
    
    // Get IP and device fingerprint for anonymous users
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);
    const deviceFingerprintHash = req.body.deviceFingerprint 
      ? hashDeviceFingerprint(req.body.deviceFingerprint, req)
      : null;

    // Check if user already voted on this review
    const existingLike = await prisma.reviewLike.findFirst({
      where: userId
        ? { reviewId: id, userId }
        : { reviewId: id, ipHash, deviceFingerprintHash },
    });

    const review = await prisma.review.findUnique({
      where: { id },
      select: { helpfulCount: true, notHelpfulCount: true },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingLike) {
      // User already voted - update their vote
      if (existingLike.isHelpful === isHelpful) {
        // Same vote - remove it
        await prisma.reviewLike.delete({ where: { id: existingLike.id } });
        
        // Update counts
        await prisma.review.update({
          where: { id },
          data: {
            helpfulCount: isHelpful 
              ? Math.max(0, review.helpfulCount - 1)
              : review.helpfulCount,
            notHelpfulCount: !isHelpful
              ? Math.max(0, review.notHelpfulCount - 1)
              : review.notHelpfulCount,
          },
        });
      } else {
        // Different vote - update it
        await prisma.reviewLike.update({
          where: { id: existingLike.id },
          data: { isHelpful },
        });

        // Update counts
        await prisma.review.update({
          where: { id },
          data: {
            helpfulCount: isHelpful 
              ? review.helpfulCount + 1
              : Math.max(0, review.helpfulCount - 1),
            notHelpfulCount: !isHelpful
              ? review.notHelpfulCount + 1
              : Math.max(0, review.notHelpfulCount - 1),
          },
        });
      }
    } else {
      // New vote
      await prisma.reviewLike.create({
        data: {
          reviewId: id,
          userId,
          ipHash,
          deviceFingerprintHash,
          isHelpful,
        },
      });

      // Update counts
      await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount,
          notHelpfulCount: !isHelpful ? review.notHelpfulCount + 1 : review.notHelpfulCount,
        },
      });
    }

    // Invalidate cache
    const updatedReview = await prisma.review.findUnique({
      where: { id },
      select: { raId: true },
    });
    if (updatedReview) {
      await deleteCache(cacheKeys.ra(updatedReview.raId));
      await deleteCache(cacheKeys.raReviews(updatedReview.raId));
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/reviews/:id
 * Update a review (only if user owns it)
 */
router.patch('/:id', authenticateToken, [
  body('ratingClarity').optional().isInt({ min: 1, max: 5 }),
  body('ratingHelpfulness').optional().isInt({ min: 1, max: 5 }),
  body('difficulty').optional().isInt({ min: 1, max: 5 }),
  body('tags').optional().isArray(),
  body('textBody').optional().isString().isLength({ max: 2000 }),
  body('wouldTakeAgain').optional().isBoolean(),
], async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, raId: true },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Prepare update data
    const updateData = {};
    if (req.body.ratingClarity !== undefined) updateData.ratingClarity = req.body.ratingClarity;
    if (req.body.ratingHelpfulness !== undefined) updateData.ratingHelpfulness = req.body.ratingHelpfulness;
    if (req.body.difficulty !== undefined) updateData.difficulty = req.body.difficulty;
    if (req.body.textBody !== undefined) updateData.textBody = req.body.textBody;
    if (req.body.wouldTakeAgain !== undefined) updateData.wouldTakeAgain = req.body.wouldTakeAgain;
    
    if (req.body.tags !== undefined) {
      updateData.tags = validateTags(req.body.tags);
    }

    // Recalculate overall rating if clarity or helpfulness changed
    if (updateData.ratingClarity !== undefined || updateData.ratingHelpfulness !== undefined) {
      const currentReview = await prisma.review.findUnique({ where: { id } });
      const clarity = updateData.ratingClarity ?? currentReview.ratingClarity;
      const helpfulness = updateData.ratingHelpfulness ?? currentReview.ratingHelpfulness;
      updateData.ratingOverall = calculateOverallRating(clarity, helpfulness);
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    // Update tag stats if tags changed
    if (updateData.tags !== undefined) {
      // Recalculate tag stats (this is simplified - in production you'd want to be more efficient)
      const allReviews = await prisma.review.findMany({
        where: { raId: review.raId, status: 'ACTIVE' },
        select: { tags: true },
      });
      
      // Rebuild tag stats
      const tagCounts = {};
      allReviews.forEach(r => {
        r.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // Update tag stats
      for (const [tag, count] of Object.entries(tagCounts)) {
        await prisma.rATagStat.upsert({
          where: { raId_tag: { raId: review.raId, tag } },
          update: { count },
          create: { raId: review.raId, tag, count },
        });
      }
    }

    // Invalidate cache
    await deleteCache(cacheKeys.ra(review.raId));
    await deleteCache(cacheKeys.raReviews(review.raId));

    res.json({
      review: updatedReview,
      message: 'Review updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
