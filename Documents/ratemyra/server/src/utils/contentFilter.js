/**
 * Content moderation utilities for filtering profanity and inappropriate language
 */

// Common profanity words (expanded list)
const PROFANITY_WORDS = [
  'fuck', 'fck', 'f*ck', 'f**k', 'f***', 'f0ck', 'f00k', 'fucc', 'fuk',
  'shit', 'sh*t', 's**t', 'sh1t', 'sht', 'shyt',
  'damn', 'd*mn', 'd**n', 'dam',
  'bitch', 'b*tch', 'b**ch', 'b1tch', 'btch', 'biatch',
  'ass', 'a*s', 'a**', 'a$$', 'arse',
  'hell', 'h*ll', 'h**l',
  'crap', 'cr*p', 'cr**p',
  'piss', 'p*ss', 'p**s',
  'dick', 'd*ck', 'd**k', 'd1ck', 'dik',
  'cock', 'c*ck', 'c**k', 'c0ck',
  'pussy', 'p*ssy', 'p**sy', 'pussie',
  'bastard', 'b*stard', 'b**tard',
  'slut', 'sl*t', 's**t',
  'whore', 'wh*re', 'wh**e',
  'retard', 'r*tard', 'r**tard', 'ret*rd',
  'nigger', 'n*gger', 'n**ger', 'nigga', 'n*gga',
  'fag', 'f*g', 'f**g', 'faggot', 'f*ggot',
  'gay', 'g*y', 'g**y', // Context-dependent, but included for filtering
  'stupid', 'st*pid', 'st**pid',
  'idiot', 'id*ot', 'id**ot',
  'moron', 'm*ron', 'm**ron',
  'dumb', 'd*mb', 'd**mb',
  'hate', 'h*te', 'h**e', // Context-dependent
];

/**
 * Normalize text for profanity detection
 * Removes special characters, converts to lowercase, handles common obfuscations
 */
function normalizeText(text) {
  if (!text) return '';
  
  // Convert to lowercase
  let normalized = text.toLowerCase();
  
  // Replace common obfuscation patterns
  // Numbers that look like letters
  normalized = normalized.replace(/0/g, 'o');
  normalized = normalized.replace(/1/g, 'i');
  normalized = normalized.replace(/3/g, 'e');
  normalized = normalized.replace(/4/g, 'a');
  normalized = normalized.replace(/5/g, 's');
  normalized = normalized.replace(/7/g, 't');
  normalized = normalized.replace(/@/g, 'a');
  normalized = normalized.replace(/\$/g, 's');
  normalized = normalized.replace(/!/g, 'i');
  normalized = normalized.replace(/\|/g, 'i');
  normalized = normalized.replace(/\*/g, ''); // Remove asterisks used for censoring
  
  // Remove special characters but keep spaces
  normalized = normalized.replace(/[^a-z\s]/g, '');
  
  // Normalize whitespace and remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Generate variations of a word to catch obfuscations
 * e.g., "fuck" -> ["fuck", "fck", "fuk", "fucc"]
 */
function generateWordVariations(word) {
  const variations = [word];
  
  // Remove vowels (fuck -> fck)
  variations.push(word.replace(/[aeiou]/g, ''));
  
  // Remove one vowel at a time
  for (let i = 0; i < word.length; i++) {
    if (/[aeiou]/.test(word[i])) {
      variations.push(word.slice(0, i) + word.slice(i + 1));
    }
  }
  
  // Double a consonant (fuck -> fucck)
  for (let i = 0; i < word.length - 1; i++) {
    if (!/[aeiou]/.test(word[i]) && word[i] === word[i + 1]) {
      // Already doubled, skip
      continue;
    }
    if (!/[aeiou]/.test(word[i])) {
      variations.push(word.slice(0, i + 1) + word[i] + word.slice(i + 1));
    }
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {Object} - { containsProfanity: boolean, matchedWords: string[] }
 */
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { containsProfanity: false, matchedWords: [] };
  }
  
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  const matchedWords = [];
  
  // Check each profanity word
  for (const profanity of PROFANITY_WORDS) {
    const normalizedProfanity = normalizeText(profanity);
    
    // Skip if profanity is too short after normalization (avoid false positives)
    if (normalizedProfanity.length < 3) continue;
    
    // Check if profanity appears as a whole word (word boundaries)
    const escapedProfanity = normalizedProfanity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`\\b${escapedProfanity}\\b`, 'i');
    if (wordBoundaryRegex.test(normalized)) {
      matchedWords.push(profanity);
      continue;
    }
    
    // Check if profanity appears as part of a word (for obfuscations like "fucking")
    // But only if it's at least 4 characters to avoid false positives
    if (normalizedProfanity.length >= 4 && normalized.includes(normalizedProfanity)) {
      matchedWords.push(profanity);
      continue;
    }
    
    // Check variations (for obfuscations like fck, f0ck, etc.)
    const variations = generateWordVariations(normalizedProfanity);
    for (const variation of variations) {
      if (variation.length >= 3 && normalized.includes(variation)) {
        matchedWords.push(profanity);
        break;
      }
    }
  }
  
  // Also check for common patterns like repeated characters (fuuuuck)
  const repeatedCharPattern = /(.)\1{3,}/g;
  const repeatedMatches = normalized.match(repeatedCharPattern);
  if (repeatedMatches) {
    for (const match of repeatedMatches) {
      const base = match[0].repeat(2); // Reduce to 2 chars
      for (const profanity of PROFANITY_WORDS) {
        const normalizedProfanity = normalizeText(profanity);
        if (normalizedProfanity.startsWith(base) || normalizedProfanity.includes(base)) {
          matchedWords.push(profanity);
        }
      }
    }
  }
  
  return {
    containsProfanity: matchedWords.length > 0,
    matchedWords: [...new Set(matchedWords)], // Remove duplicates
  };
}

/**
 * Filter profanity from text (replaces with asterisks)
 * @param {string} text - Text to filter
 * @returns {string} - Filtered text
 */
export function filterProfanity(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  const { matchedWords } = containsProfanity(text);
  if (matchedWords.length === 0) {
    return text;
  }
  
  let filtered = text;
  const normalized = normalizeText(text);
  
  for (const profanity of matchedWords) {
    const normalizedProfanity = normalizeText(profanity);
    const regex = new RegExp(normalizedProfanity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    filtered = filtered.replace(regex, '*'.repeat(profanity.length));
  }
  
  return filtered;
}

/**
 * Validate review content for profanity
 * @param {string} textBody - Review text to validate
 * @returns {Object} - { isValid: boolean, error?: string, matchedWords?: string[] }
 */
export function validateReviewContent(textBody) {
  if (!textBody || textBody.trim().length === 0) {
    return { isValid: true }; // Empty text is valid
  }
  
  const result = containsProfanity(textBody);
  
  if (result.containsProfanity) {
    return {
      isValid: false,
      error: 'Your review contains inappropriate language. Please revise your review to remove any profanity or offensive content.',
      matchedWords: result.matchedWords,
    };
  }
  
  return { isValid: true };
}
