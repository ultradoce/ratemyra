/**
 * Weighted rating calculation with time decay
 * Recent reviews matter more than older ones
 */

/**
 * Calculate weighted average rating with time decay
 * @param {Array} reviews - Array of review objects with ratingOverall and timestamp
 * @param {number} minReviews - Minimum number of reviews to show a rating
 * @returns {number|null} - Weighted rating or null if below threshold
 */
export function calculateWeightedRating(reviews, minReviews = 3) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  if (reviews.length < minReviews) {
    return null; // Don't show rating until minimum threshold
  }

  const now = Date.now();
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  const decayFactor = 0.5; // How much older reviews are weighted

  let totalWeight = 0;
  let weightedSum = 0;

  reviews.forEach(review => {
    const age = now - new Date(review.timestamp).getTime();
    const ageRatio = Math.max(0, 1 - (age / maxAge)); // 1 for recent, 0 for old
    const weight = 1 + (ageRatio * (1 / decayFactor - 1)); // Recent reviews get higher weight
    
    totalWeight += weight;
    weightedSum += review.ratingOverall * weight;
  });

  const weightedAverage = weightedSum / totalWeight;
  
  // Round to 1 decimal place
  return Math.round(weightedAverage * 10) / 10;
}

/**
 * Calculate overall rating from clarity and helpfulness
 * @param {number} clarity - Rating 1-5
 * @param {number} helpfulness - Rating 1-5
 * @returns {number} - Overall rating 1-5
 */
export function calculateOverallRating(clarity, helpfulness) {
  // Simple average, can be adjusted
  return (clarity + helpfulness) / 2;
}

/**
 * Get rating distribution (how many 1s, 2s, 3s, etc.)
 * @param {Array} reviews - Array of reviews
 * @returns {Object} - Distribution object
 */
export function getRatingDistribution(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    const rating = Math.round(review.ratingOverall);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });
  
  return distribution;
}

/**
 * Calculate difficulty average
 * @param {Array} reviews - Array of reviews with difficulty
 * @returns {number|null}
 */
export function calculateAverageDifficulty(reviews) {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  const sum = reviews.reduce((acc, review) => acc + review.difficulty, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Calculate "Would Take Again" percentage (RMP-style)
 * Only counts reviews where wouldTakeAgain is not null
 * @param {Array} reviews - Array of reviews with wouldTakeAgain field
 * @returns {number|null} - Percentage (0-100) or null if no data
 */
export function calculateWouldTakeAgainPercentage(reviews) {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  // Only count reviews where wouldTakeAgain is explicitly set (not null)
  const reviewsWithAnswer = reviews.filter(r => r.wouldTakeAgain !== null && r.wouldTakeAgain !== undefined);
  
  if (reviewsWithAnswer.length === 0) {
    return null;
  }
  
  const yesCount = reviewsWithAnswer.filter(r => r.wouldTakeAgain === true).length;
  const percentage = (yesCount / reviewsWithAnswer.length) * 100;
  
  return Math.round(percentage);
}
