/**
 * Track page views for analytics
 * This sends anonymous view data to the backend
 */

/**
 * Get user's state from IP (simplified - in production use a geolocation service)
 * For now, we'll try to extract from timezone or use a service
 */
async function getUserState() {
  try {
    // Try to get state from timezone (rough approximation)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map common timezones to states (simplified)
    const timezoneToState = {
      'America/New_York': 'NY',
      'America/Chicago': 'IL',
      'America/Denver': 'CO',
      'America/Los_Angeles': 'CA',
      'America/Phoenix': 'AZ',
      'America/Anchorage': 'AK',
      'Pacific/Honolulu': 'HI',
    };

    // Try to get more accurate location from a free service
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      if (response.ok) {
        const data = await response.json();
        if (data.region_code && data.country_code === 'US') {
          return data.region_code; // Returns state code like 'CA', 'NY'
        }
      }
    } catch (err) {
      // Fallback to timezone if service fails
      console.log('Geolocation service unavailable, using timezone fallback');
    }

    // Fallback to timezone mapping
    return timezoneToState[timezone] || null;
  } catch (error) {
    console.warn('Failed to get user state:', error);
    return null;
  }
}

/**
 * Hash IP address for privacy
 */
function hashIP(ip) {
  // Simple hash function (in production, use crypto)
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Track a page view
 * @param {string} pageType - Type of page ('ra', 'home', 'search', 'review')
 * @param {string} pageId - ID of the page (RA ID, review ID, etc.)
 */
export async function trackPageView(pageType, pageId = null) {
  try {
    // Get user state
    const state = await getUserState();
    
    // Get IP hash (simplified - in production get from backend)
    const ipHash = hashIP('client'); // Placeholder
    
    // Get other metadata
    const userAgent = navigator.userAgent;
    const referrer = document.referrer || null;
    const country = 'US'; // Default, could be enhanced

    // Send to backend
    await fetch('/api/admin/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageType,
        pageId,
        state,
        country,
        ipHash,
        userAgent,
        referrer,
      }),
    }).catch(err => {
      // Silently fail - don't interrupt user experience
      console.log('View tracking failed (non-critical):', err);
    });
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.log('View tracking error (non-critical):', error);
  }
}
