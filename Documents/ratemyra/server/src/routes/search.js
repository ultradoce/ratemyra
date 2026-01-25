import express from 'express';
import { getPrismaClient } from '../utils/prisma.js';
import { calculateWeightedRating, calculateAverageDifficulty, calculateWouldTakeAgainPercentage } from '../utils/rating.js';
import { getCache, setCache, cacheKeys } from '../utils/cache.js';

const router = express.Router();
const prisma = getPrismaClient();

/**
 * GET /api/search
 * Search for RAs with ranking algorithm
 */
router.get('/', async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { q, schoolId, limit = 20 } = req.query;
    
    console.log('Search endpoint called:', { q, schoolId, limit, queryKeys: Object.keys(req.query) });

    // Validate schoolId - handle both string and non-string values
    // schoolId is now optional - if not provided, search across all schools
    const schoolIdStr = schoolId ? String(schoolId).trim() : '';

    // Allow empty or very short queries - just return empty results
    const searchTerm = q ? String(q).trim() : '';
    
    console.log('Search params processed:', { searchTerm, schoolIdStr, limit });
    
    // Return empty results for empty queries (don't error)
    if (searchTerm.length === 0) {
      return res.json({
        query: '',
        results: [],
        total: 0,
      });
    }
    
    // Try cache (wrap in try-catch in case cache fails)
    let cached = null;
    const cacheKey = cacheKeys.search(searchTerm, schoolIdStr || 'all');
    try {
      cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (cacheError) {
      console.warn('Cache error (non-fatal):', cacheError.message);
      // Continue without cache
    }

    // Build search query for RAs - schoolId is optional
    const raWhere = {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { dorm: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };
    
    // Build search query for Staff
    const staffWhere = {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { department: { contains: searchTerm, mode: 'insensitive' } },
        { title: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };
    
    // If schoolId is provided, filter by school
    if (schoolIdStr && schoolIdStr.length > 0) {
      raWhere.schoolId = schoolIdStr;
      staffWhere.schoolId = schoolIdStr;
    }

    // Fetch RAs and Staff in parallel
    const [ras, staffMembers] = await Promise.all([
      prisma.rA.findMany({
        where: raWhere,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              location: true,
              domain: true,
            },
          },
          reviews: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              ratingClarity: true,
              ratingHelpfulness: true,
              ratingOverall: true,
              difficulty: true,
              wouldTakeAgain: true,
              tags: true,
              textBody: true,
              timestamp: true,
            },
          },
        },
        take: parseInt(limit) * 2,
      }),
      prisma.professionalStaff.findMany({
        where: staffWhere,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              location: true,
              domain: true,
            },
          },
          reviews: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              ratingClarity: true,
              ratingHelpfulness: true,
              ratingOverall: true,
              difficulty: true,
              wouldTakeAgain: true,
              tags: true,
              textBody: true,
              timestamp: true,
            },
          },
        },
        take: parseInt(limit) * 2,
      }),
    ]);

    // Calculate scores for ranking RAs
    const rasWithScores = await Promise.all(
      ras.map(async (ra) => {
        const reviews = ra.reviews;
        const rating = calculateWeightedRating(reviews);
        const reviewCount = reviews.length;
        const averageDifficulty = calculateAverageDifficulty(reviews);
        const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);

        const ratingWeight = 0.6;
        const volumeWeight = 0.3;
        const recencyWeight = 0.1;

        const normalizedRating = rating ? rating / 5 : 0;
        const volumeScore = Math.log(reviewCount + 1) / Math.log(100);
        const recencyScore = reviews.length > 0
          ? Math.min(1, (Date.now() - new Date(reviews[0].timestamp).getTime()) / (365 * 24 * 60 * 60 * 1000))
          : 0;

        const score =
          ratingWeight * normalizedRating +
          volumeWeight * volumeScore +
          recencyWeight * (1 - recencyScore);

        return {
          type: 'ra',
          id: ra.id,
          firstName: ra.firstName,
          lastName: ra.lastName,
          school: ra.school,
          dorm: ra.dorm,
          floor: ra.floor,
          rating,
          totalReviews: reviewCount,
          averageDifficulty,
          wouldTakeAgainPercentage,
          score,
        };
      })
    );

    // Calculate scores for ranking Staff
    const staffWithScores = await Promise.all(
      staffMembers.map(async (staff) => {
        const reviews = staff.reviews;
        const rating = calculateWeightedRating(reviews);
        const reviewCount = reviews.length;
        const averageDifficulty = calculateAverageDifficulty(reviews);
        const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);

        const ratingWeight = 0.6;
        const volumeWeight = 0.3;
        const recencyWeight = 0.1;

        const normalizedRating = rating ? rating / 5 : 0;
        const volumeScore = Math.log(reviewCount + 1) / Math.log(100);
        const recencyScore = reviews.length > 0
          ? Math.min(1, (Date.now() - new Date(reviews[0].timestamp).getTime()) / (365 * 24 * 60 * 60 * 1000))
          : 0;

        const score =
          ratingWeight * normalizedRating +
          volumeWeight * volumeScore +
          recencyWeight * (1 - recencyScore);

        return {
          type: 'staff',
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          school: staff.school,
          department: staff.department,
          title: staff.title,
          office: staff.office,
          rating,
          totalReviews: reviewCount,
          averageDifficulty,
          wouldTakeAgainPercentage,
          score,
        };
      })
    );

    // Combine and sort by score (descending) and limit
    const allResults = [...rasWithScores, ...staffWithScores];
    allResults.sort((a, b) => b.score - a.score);
    const results = allResults.slice(0, parseInt(limit));

    // Remove score from response (internal only)
    const cleanResults = results.map(({ score, ...rest }) => rest);

    const response = {
      query: searchTerm,
      results: cleanResults,
      total: cleanResults.length,
    };

    // Cache for 5 minutes
    await setCache(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    console.error('Search endpoint error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    // Don't send 400 for database errors - send 500
    if (error.code && error.code.startsWith('P')) {
      return res.status(500).json({ 
        error: 'Database error',
        message: error.message 
      });
    }
    next(error);
  }
});

export default router;
