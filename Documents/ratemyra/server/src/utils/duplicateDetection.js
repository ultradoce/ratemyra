/**
 * Duplicate detection utilities for RAs
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} - Distance (0 = identical, higher = more different)
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number}
 */
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLen);
}

/**
 * Check if an RA might be a duplicate
 * @param {Object} prisma - Prisma client
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} - Array of potential duplicates with similarity scores
 */
export async function findPotentialDuplicates(prisma, firstName, lastName, schoolId) {
  // First, find RAs in the same school
  const existingRAs = await prisma.rA.findMany({
    where: {
      schoolId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dorm: true,
      floor: true,
    },
  });

  const potentialDuplicates = [];

  for (const ra of existingRAs) {
    const firstNameSim = similarity(firstName, ra.firstName);
    const lastNameSim = similarity(lastName, ra.lastName);
    const avgSim = (firstNameSim + lastNameSim) / 2;

    // If similarity is above 0.8 (80%), consider it a potential duplicate
    if (avgSim >= 0.8) {
      potentialDuplicates.push({
        ...ra,
        similarity: avgSim,
        firstNameSimilarity: firstNameSim,
        lastNameSimilarity: lastNameSim,
      });
    }
  }

  // Sort by similarity (highest first)
  return potentialDuplicates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Normalize name for comparison (remove extra spaces, lowercase)
 * @param {string} name 
 * @returns {string}
 */
export function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
