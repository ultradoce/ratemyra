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
    const schoolIdStr = schoolId ? String(schoolId).trim() : '';
    if (!schoolIdStr || schoolIdStr.length === 0) {
      console.error('Search endpoint: Missing or invalid schoolId', { schoolId, q, limit, type: typeof schoolId });
      return res.status(400).json({ 
        error: 'School ID is required',
        received: { schoolId, q, limit }
      });
    }

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
    try {
      const cacheKey = cacheKeys.search(searchTerm, schoolIdStr);
      cached = await getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (cacheError) {
      console.warn('Cache error (non-fatal):', cacheError.message);
      // Continue without cache
    }

    // Build search query - schoolId is required
    const where = {
      schoolId: schoolIdStr,
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { dorm: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    // Fetch RAs
    // Use select to only get fields that exist (migration may not have run yet)
    const ras = await prisma.rA.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dorm: true,
        floor: true,
        school: true,
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
            // Don't select userId, helpfulCount, notHelpfulCount - they may not exist until migration runs
          },
        },
      },
      take: parseInt(limit) * 2, // Get more to rank, then limit
    });

    // Calculate scores for ranking
    const rasWithScores = await Promise.all(
      ras.map(async (ra) => {
        const reviews = ra.reviews;
        const rating = calculateWeightedRating(reviews);
        const reviewCount = reviews.length;
        const averageDifficulty = calculateAverageDifficulty(reviews);
        const wouldTakeAgainPercentage = calculateWouldTakeAgainPercentage(reviews);

        // Ranking algorithm
        // score = rating_weight * normalized_rating + volume_weight * log(review_count) + recency_weight
        const ratingWeight = 0.6;
        const volumeWeight = 0.3;
        const recencyWeight = 0.1;

        const normalizedRating = rating ? rating / 5 : 0; // Normalize to 0-1
        const volumeScore = Math.log(reviewCount + 1) / Math.log(100); // Log scale, max at 100 reviews
        const recencyScore = reviews.length > 0
          ? Math.min(1, (Date.now() - new Date(reviews[0].timestamp).getTime()) / (365 * 24 * 60 * 60 * 1000))
          : 0;

        const score =
          ratingWeight * normalizedRating +
          volumeWeight * volumeScore +
          recencyWeight * (1 - recencyScore); // More recent = higher score

        return {
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
          score, // For sorting
        };
      })
    );

    // Sort by score (descending) and limit
    rasWithScores.sort((a, b) => b.score - a.score);
    const results = rasWithScores.slice(0, parseInt(limit));

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
