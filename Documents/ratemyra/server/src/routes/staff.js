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

// Rate limiting: 10 staff submissions per hour per IP
const createStaffRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many staff submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/staff/:id
 * Get professional staff profile with aggregated stats
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    
    // Try cache first
    const cacheKey = cacheKeys.staff ? cacheKeys.staff(id) : `staff:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const staff = await prisma.professionalStaff.findUnique({
      where: { id },
      include: {
        school: true,
        reviews: {
          where: { status: 'ACTIVE' },
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Calculate aggregated stats
    const reviews = staff.reviews || [];
    const rating = calculateWeightedRating(reviews);
    const ratingDistribution = getRatingDistribution(reviews);
    const averageDifficulty = calculateAverageDifficulty(reviews);
    const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);
    const totalReviews = reviews.length;

    const result = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      school: staff.school,
      department: staff.department,
      title: staff.title,
      office: staff.office,
      rating,
      totalReviews,
      ratingDistribution,
      averageDifficulty,
      wouldTakeAgainPercentage,
      reviews: reviews.map(review => ({
        id: review.id,
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
      })),
    };

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/staff
 * List professional staff with optional filters and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { schoolId, department, search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (schoolId) {
      where.schoolId = schoolId;
    }
    
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [staffMembers, total] = await Promise.all([
      prisma.professionalStaff.findMany({
        where,
        include: {
          school: true,
          _count: {
            select: { reviews: { where: { status: 'ACTIVE' } } },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.professionalStaff.count({ where }),
    ]);

    // Calculate ratings for each staff member
    const staffWithRatings = await Promise.all(
      staffMembers.map(async (staff) => {
        const reviews = await prisma.staffReview.findMany({
          where: {
            staffId: staff.id,
            status: 'ACTIVE',
          },
        });
        
        const rating = calculateWeightedRating(reviews);
        const averageDifficulty = calculateAverageDifficulty(reviews);
        const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);
        
        return {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          school: staff.school,
          department: staff.department,
          title: staff.title,
          office: staff.office,
          rating,
          averageDifficulty,
          wouldTakeAgainPercentage,
          totalReviews: reviews.length,
          createdAt: staff.createdAt,
        };
      })
    );

    res.json({
      staff: staffWithRatings,
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
 * POST /api/staff
 * Create a new professional staff member (submitted by students)
 */
router.post(
  '/',
  createStaffRateLimit,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }).withMessage('First name must be under 50 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }).withMessage('Last name must be under 50 characters'),
    body('schoolId').notEmpty().withMessage('School is required'),
    body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be under 100 characters'),
    body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be under 100 characters'),
    body('office').optional().trim().isLength({ max: 100 }).withMessage('Office must be under 100 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, schoolId, department, title, office } = req.body;

      // Verify school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });

      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      // Check for potential duplicates
      const forceCreate = req.headers['x-force-create'] === 'true';
      
      if (!forceCreate) {
        // Simple duplicate check for staff (can enhance later)
        const existing = await prisma.professionalStaff.findFirst({
          where: {
            schoolId,
            firstName: { equals: firstName.trim(), mode: 'insensitive' },
            lastName: { equals: lastName.trim(), mode: 'insensitive' },
          },
        });

        if (existing) {
          return res.status(409).json({
            error: 'Staff member already exists',
            duplicate: {
              id: existing.id,
              firstName: existing.firstName,
              lastName: existing.lastName,
            },
            message: 'A staff member with this name already exists at this school.',
          });
        }
      }

      // Create the staff member
      const staff = await prisma.professionalStaff.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          schoolId,
          department: department?.trim() || null,
          title: title?.trim() || null,
          office: office?.trim() || null,
        },
        include: {
          school: true,
        },
      });

      res.status(201).json({
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        school: staff.school,
        department: staff.department,
        title: staff.title,
        office: staff.office,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
