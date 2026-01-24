/**
 * Structured tag system for reviews
 * Tags are predefined codes, not free-text
 */

export const REVIEW_TAGS = {
  // Positive tags
  CLEAR_COMMUNICATION: 'CLEAR_COMMUNICATION',
  HELPFUL: 'HELPFUL',
  RESPONSIVE: 'RESPONSIVE',
  FRIENDLY: 'FRIENDLY',
  ORGANIZED: 'ORGANIZED',
  FAIR: 'FAIR',
  SUPPORTIVE: 'SUPPORTIVE',
  
  // Neutral/Negative tags
  STRICT: 'STRICT',
  UNORGANIZED: 'UNORGANIZED',
  UNRESPONSIVE: 'UNRESPONSIVE',
  HARSH: 'HARSH',
};

export const TAG_DISPLAY_NAMES = {
  CLEAR_COMMUNICATION: 'Clear Communication',
  HELPFUL: 'Helpful',
  RESPONSIVE: 'Responsive',
  FRIENDLY: 'Friendly',
  ORGANIZED: 'Organized',
  FAIR: 'Fair',
  SUPPORTIVE: 'Supportive',
  STRICT: 'Strict',
  UNORGANIZED: 'Unorganized',
  UNRESPONSIVE: 'Unresponsive',
  HARSH: 'Harsh',
};

/**
 * Validate tags array
 * @param {Array} tags - Array of tag codes
 * @returns {Array} - Validated and filtered tags
 */
export function validateTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }
  
  const validTags = Object.values(REVIEW_TAGS);
  return tags.filter(tag => validTags.includes(tag));
}

/**
 * Update tag statistics for an RA
 * @param {Object} prisma - Prisma client instance
 * @param {string} raId - RA ID
 * @param {Array} tags - Array of tag codes
 */
export async function updateTagStats(prisma, raId, tags) {
  const validTags = validateTags(tags);
  
  for (const tag of validTags) {
    await prisma.rATagStat.upsert({
      where: {
        raId_tag: {
          raId,
          tag,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        raId,
        tag,
        count: 1,
      },
    });
  }
}
