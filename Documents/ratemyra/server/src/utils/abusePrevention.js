import crypto from 'crypto';

/**
 * Hash IP address for abuse tracking without storing raw IPs
 * @param {string} ip - IP address
 * @returns {string} - SHA256 hash of IP
 */
export function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Generate device fingerprint hash
 * @param {Object} req - Express request object
 * @returns {string} - Hash of device fingerprint
 */
export function hashDeviceFingerprint(req) {
  const fingerprint = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['accept-encoding'],
  ].filter(Boolean).join('|');
  
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

/**
 * Get client IP address (handles proxies)
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Check for duplicate/similar reviews
 * @param {string} textBody - Review text
 * @param {Array} existingReviews - Array of existing review texts
 * @returns {boolean} - True if suspiciously similar
 */
export function detectSimilarReviews(textBody, existingReviews) {
  if (!textBody || !existingReviews || existingReviews.length === 0) {
    return false;
  }

  const normalizedText = textBody.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 3);
  
  for (const existing of existingReviews) {
    if (!existing) continue;
    
    const normalizedExisting = existing.toLowerCase().replace(/[^\w\s]/g, '');
    const existingWords = normalizedExisting.split(/\s+/).filter(w => w.length > 3);
    
    // Calculate Jaccard similarity
    const intersection = words.filter(w => existingWords.includes(w)).length;
    const union = new Set([...words, ...existingWords]).size;
    const similarity = intersection / union;
    
    // If > 80% similar, flag as potential duplicate
    if (similarity > 0.8) {
      return true;
    }
  }
  
  return false;
}
