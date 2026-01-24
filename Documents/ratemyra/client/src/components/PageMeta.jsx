import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageMeta(title, description, image) {
  const location = useLocation();

  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | RateMyRA`;
    }

    // Update meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
    }

    if (title) {
      updateMetaTag('og:title', title, true);
    }

    // Update canonical URL
    const canonicalUrl = `https://ratemyra.com${location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
    updateMetaTag('og:url', canonicalUrl, true);

    if (image) {
      updateMetaTag('og:image', image, true);
    }
  }, [title, description, image, location.pathname]);
}
