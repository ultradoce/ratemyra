import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { calculateOverallRating } from '../utils/rating.js';
import { hashIP, hashDeviceFingerprint, getClientIP, detectSimilarReviews } from '../utils/abusePrevention.js';
import { validateTags, updateTagStats, TAG_DISPLAY_NAMES } from '../utils/tags.js';
import { deleteCache, cacheKeys, getCache, setCache } from '../utils/cache.js';

const router = express.Router();
const prisma = new PrismaClient();

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
      const deviceFingerprintHash = hashDeviceFingerprint(req);

      // Check for recent reviews from same IP/device
      const recentReviews = await prisma.review.findMany({
        where: {
          ipHash,
          raId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentReviews.length > 0) {
        return res.status(429).json({
          error: 'You have already submitted a review for this RA recently.',
        });
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

      // Create review
      const review = await prisma.review.create({
        data: {
          raId,
          courseCode,
          ratingClarity,
          ratingHelpfulness,
          ratingOverall,
          difficulty,
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
 * GET /api/reviews/:raId
 * Get reviews for a specific RA
 */
router.get('/:raId', async (req, res, next) => {
  try {
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
          tags: true,
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

export default router;
