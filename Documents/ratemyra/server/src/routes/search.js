import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateWeightedRating } from '../utils/rating.js';
import { getCache, setCache, cacheKeys } from '../utils/cache.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/search
 * Search for RAs with ranking algorithm
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, schoolId, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = q.trim();
    
    // Try cache
    const cacheKey = cacheKeys.search(searchTerm, schoolId);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Build search query
    const where = {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { dorm: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (schoolId) {
      where.schoolId = schoolId;
    }

    // Fetch RAs
    const ras = await prisma.rA.findMany({
      where,
      include: {
        school: true,
        reviews: {
          where: { status: 'ACTIVE' },
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
    next(error);
  }
});

export default router;
