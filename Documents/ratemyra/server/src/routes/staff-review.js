import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getPrismaClient } from '../utils/prisma.js';
import { calculateOverallRating } from '../utils/rating.js';
import { hashIP, hashDeviceFingerprint, getClientIP, detectSimilarReviews } from '../utils/abusePrevention.js';
import { validateTags, updateTagStats, TAG_DISPLAY_NAMES } from '../utils/tags.js';
import { deleteCache, cacheKeys, getCache, setCache } from '../utils/cache.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateReviewContent } from '../utils/contentFilter.js';

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
 * POST /api/staff-reviews
 * Submit a new staff review
 */
router.post(
  '/',
  reviewRateLimit,
  [
    body('staffId').notEmpty().withMessage('Staff ID is required'),
    body('ratingClarity').isInt({ min: 1, max: 5 }).withMessage('Clarity rating must be 1-5'),
    body('ratingHelpfulness').isInt({ min: 1, max: 5 }).withMessage('Helpfulness rating must be 1-5'),
    body('difficulty').isInt({ min: 1, max: 5 }).withMessage('Difficulty must be 1-5'),
    body('semesters').isArray({ min: 1 }).withMessage('At least one semester is required'),
    body('semesters.*').isString().withMessage('Each semester must be a string'),
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
        staffId,
        semesters,
        ratingClarity,
        ratingHelpfulness,
        difficulty,
        wouldTakeAgain,
        tags = [],
        textBody,
      } = req.body;

      // Validate review content for profanity
      if (textBody) {
        const contentValidation = validateReviewContent(textBody);
        if (!contentValidation.isValid) {
          return res.status(400).json({
            error: 'Review contains inappropriate language',
            message: contentValidation.message,
          });
        }
      }

      // Verify staff exists
      const staff = await prisma.professionalStaff.findUnique({
        where: { id: staffId },
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Get IP and device fingerprint for abuse prevention
      const clientIP = getClientIP(req);
      const ipHash = hashIP(clientIP);
      const deviceFingerprintHash = hashDeviceFingerprint(req, req.body);

      // Check for similar reviews (abuse prevention)
      const similarReviews = await detectSimilarReviews(prisma, {
        staffId,
        ipHash,
        deviceFingerprintHash,
        textBody,
      });

      if (similarReviews.length > 0) {
        return res.status(429).json({
          error: 'Similar review already submitted',
          message: 'You have already submitted a similar review for this staff member.',
        });
      }

      // Calculate overall rating
      const ratingOverall = calculateOverallRating(ratingClarity, ratingHelpfulness);

      // Validate and clean tags
      const validTags = validateTags(tags);

      // Get userId if user is authenticated (optional - reviews can be anonymous)
      const userId = req.user?.id || null;

      // Create review
      const review = await prisma.staffReview.create({
        data: {
          staffId,
          userId,
          semesters: semesters || [],
          ratingClarity,
          ratingHelpfulness,
          ratingOverall,
          difficulty,
          wouldTakeAgain: wouldTakeAgain !== undefined ? wouldTakeAgain : null,
          tags: validTags,
          textBody,
          ipHash,
          deviceFingerprintHash,
          status: 'ACTIVE',
        },
      });

      // Update tag statistics
      if (validTags.length > 0) {
        // Similar to RA tag stats, but for staff
        for (const tag of validTags) {
          await prisma.staffTagStat.upsert({
            where: {
              staffId_tag: {
                staffId,
                tag,
              },
            },
            update: {
              count: { increment: 1 },
            },
            create: {
              staffId,
              tag,
              count: 1,
            },
          });
        }
      }

      // Invalidate cache for this staff member
      const staffCacheKey = cacheKeys.staff ? cacheKeys.staff(staffId) : `staff:${staffId}`;
      await deleteCache(staffCacheKey);

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
 * GET /api/staff-reviews/:staffId
 * Get reviews for a specific staff member
 */
router.get('/:staffId', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { staffId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Try cache first (only for first page)
    const cacheKey = pageNum === 1 ? `staff-reviews:${staffId}:page:1` : null;
    if (cacheKey) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    // Get total count and reviews
    const [total, reviewsRaw] = await Promise.all([
      prisma.staffReview.count({
        where: {
          staffId,
          status: 'ACTIVE',
        },
      }),
      prisma.staffReview.findMany({
        where: {
          staffId,
          status: 'ACTIVE',
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    // Map reviews to only include safe fields
    const reviews = reviewsRaw.map(review => ({
      id: review.id,
      semesters: review.semesters || [],
      ratingClarity: review.ratingClarity,
      ratingHelpfulness: review.ratingHelpfulness,
      ratingOverall: review.ratingOverall,
      difficulty: review.difficulty,
      wouldTakeAgain: review.wouldTakeAgain ?? null,
      tags: review.tags || [],
      textBody: review.textBody || null,
      timestamp: review.timestamp,
      helpfulCount: review.helpfulCount ?? 0,
      notHelpfulCount: review.notHelpfulCount ?? 0,
      userId: review.userId || null,
    }));

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
 * POST /api/staff-reviews/:id/like
 * Vote on a staff review (helpful/not helpful)
 */
router.post('/:id/like', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { isHelpful, deviceFingerprint } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: 'isHelpful must be a boolean' });
    }

    // Get IP and device fingerprint
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);
    const deviceFingerprintHash = deviceFingerprint ? hashDeviceFingerprint(req, { deviceFingerprint }) : null;

    // Check if review exists
    const review = await prisma.staffReview.findUnique({
      where: { id },
    });

    if (!review || review.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user already voted (by IP/device or userId)
    const userId = req.user?.id || null;
    const existingLike = await prisma.staffReviewLike.findFirst({
      where: userId
        ? { reviewId: id, userId }
        : { reviewId: id, ipHash, deviceFingerprintHash },
    });

    if (existingLike) {
      // User already voted, update the vote
      if (existingLike.isHelpful !== isHelpful) {
        // Vote changed, update counts accordingly
        await prisma.staffReviewLike.update({
          where: { id: existingLike.id },
          data: { isHelpful },
        });

        // Update review counts
        await prisma.staffReview.update({
          where: { id },
          data: {
            helpfulCount: isHelpful
              ? { increment: 1 }
              : { decrement: 1 },
            notHelpfulCount: isHelpful
              ? { decrement: 1 }
              : { increment: 1 },
          },
        });
      }
    } else {
      // New vote
      await prisma.staffReviewLike.create({
        data: {
          reviewId: id,
          userId,
          ipHash,
          deviceFingerprintHash,
          isHelpful,
        },
      });

      // Update review counts
      await prisma.staffReview.update({
        where: { id },
        data: {
          helpfulCount: isHelpful ? { increment: 1 } : undefined,
          notHelpfulCount: isHelpful ? undefined : { increment: 1 },
        },
      });
    }

    // Invalidate cache
    const staffCacheKey = cacheKeys.staff ? cacheKeys.staff(review.staffId) : `staff:${review.staffId}`;
    await deleteCache(staffCacheKey);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/staff-reviews/public/:id
 * Get a single staff review by ID (public, no auth required)
 */
router.get('/public/:id', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    const review = await prisma.staffReview.findUnique({
      where: { id },
      include: {
        staff: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!review || review.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Return safe fields only
    res.json({
      review: {
        id: review.id,
        staffId: review.staffId,
        semesters: review.semesters || [],
        ratingClarity: review.ratingClarity,
        ratingHelpfulness: review.ratingHelpfulness,
        ratingOverall: review.ratingOverall,
        difficulty: review.difficulty,
        wouldTakeAgain: review.wouldTakeAgain,
        tags: review.tags || [],
        textBody: review.textBody,
        timestamp: review.timestamp,
        helpfulCount: review.helpfulCount || 0,
        notHelpfulCount: review.notHelpfulCount || 0,
        staff: {
          id: review.staff.id,
          firstName: review.staff.firstName,
          lastName: review.staff.lastName,
          department: review.staff.department,
          title: review.staff.title,
          office: review.staff.office,
          school: review.staff.school,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
