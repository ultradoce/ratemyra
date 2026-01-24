/**
 * Collect device fingerprint data for abuse prevention
 * This helps prevent duplicate reviews from the same device
 */
export function collectDeviceFingerprint() {
  try {
    const fingerprint = {
      // Screen properties
      screenWidth: window.screen?.width || null,
      screenHeight: window.screen?.height || null,
      screenColorDepth: window.screen?.colorDepth || null,
      screenPixelDepth: window.screen?.pixelDepth || null,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      timezoneOffset: new Date().getTimezoneOffset() || null,
      
      // Platform
      platform: navigator.platform || null,
      language: navigator.language || null,
      languages: navigator.languages?.join(',') || null,
      
      // Hardware
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      maxTouchPoints: navigator.maxTouchPoints || null,
      
      // Browser capabilities
      cookieEnabled: navigator.cookieEnabled || false,
      doNotTrack: navigator.doNotTrack || null,
      
      // Canvas fingerprint (basic)
      canvasHash: getCanvasFingerprint(),
    };

    return fingerprint;
  } catch (error) {
    console.warn('Failed to collect device fingerprint:', error);
    return {};
  }
}

/**
 * Generate a basic canvas fingerprint
 * This is a simple hash based on canvas rendering
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('RateMyRA', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('RateMyRA', 4, 17);

    // Convert to base64 and hash
    const dataURL = canvas.toDataURL();
    return hashString(dataURL.substring(0, 100)); // Use first 100 chars for hash
  } catch (error) {
    return null;
  }
}

/**
 * Simple hash function for fingerprint data
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
