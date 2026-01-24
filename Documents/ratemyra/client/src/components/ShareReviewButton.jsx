import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast.jsx';
import './ShareReviewButton.css';

function ShareReviewButton({ review, ra }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { success: showSuccess, error: showError } = useToast();

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleCopyLink = async () => {
    const reviewUrl = `${window.location.origin}/review/${review.id}`;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      showSuccess('Review link copied to clipboard!');
      setShowMenu(false);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = reviewUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess('Review link copied to clipboard!');
        setShowMenu(false);
      } catch (fallbackErr) {
        showError('Failed to copy link. Please try again.');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDownloadImage = async () => {
    try {
      // Dynamically import html-to-image
      const htmlToImage = await import('html-to-image');
      const reviewCard = document.querySelector(`[data-review-id="${review.id}"]`);
      
      if (!reviewCard) {
        showError('Could not find review to generate image.');
        return;
      }

      // Create a temporary container with the review content for image generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '40px';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.opacity = '0';
      tempContainer.style.pointerEvents = 'none';
      
      // Clone the review card with deep clone to include all styles
      const clonedCard = reviewCard.cloneNode(true);
      
      // Get computed styles and apply them
      const computedStyles = window.getComputedStyle(reviewCard);
      clonedCard.style.width = computedStyles.width || '100%';
      clonedCard.style.margin = '0';
      clonedCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      clonedCard.style.border = '1px solid #e0e0e0';
      clonedCard.style.borderRadius = '8px';
      clonedCard.style.background = '#ffffff';
      clonedCard.style.padding = computedStyles.padding || '24px';
      
      // Remove action buttons from cloned content
      const actions = clonedCard.querySelector('.review-actions');
      if (actions) actions.remove();
      
      // Copy all computed styles to cloned elements recursively
      const copyStyles = (source, target) => {
        const sourceStyles = window.getComputedStyle(source);
        Array.from(sourceStyles).forEach(prop => {
          try {
            target.style.setProperty(prop, sourceStyles.getPropertyValue(prop));
          } catch (e) {
            // Ignore read-only properties
          }
        });
        
        // Handle children
        const sourceChildren = source.children;
        const targetChildren = target.children;
        for (let i = 0; i < Math.min(sourceChildren.length, targetChildren.length); i++) {
          copyStyles(sourceChildren[i], targetChildren[i]);
        }
      };
      
      // Copy styles from original to clone
      copyStyles(reviewCard, clonedCard);
      
      tempContainer.appendChild(clonedCard);
      document.body.appendChild(tempContainer);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate image
      const dataUrl = await htmlToImage.toPng(tempContainer, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Download the image
      const link = document.createElement('a');
      link.download = `review-${review.id}.png`;
      link.href = dataUrl;
      link.click();

      showSuccess('Review image downloaded!');
      setShowMenu(false);
    } catch (err) {
      console.error('Error generating image:', err);
      showError('Failed to generate image. Please try again.');
    }
  };

  return (
    <div className="share-review-container" ref={menuRef}>
      <button
        type="button"
        className="share-review-btn"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Share review"
      >
        🔗 Share
      </button>
      {showMenu && (
        <div className="share-review-menu">
          <button
            type="button"
            className="share-review-option"
            onClick={handleCopyLink}
          >
            📋 Copy Link
          </button>
          <button
            type="button"
            className="share-review-option"
            onClick={handleDownloadImage}
          >
            🖼️ Download Image
          </button>
          <Link
            to={`/review/${review.id}`}
            className="share-review-option"
            onClick={() => setShowMenu(false)}
          >
            👁️ View Full Review
          </Link>
        </div>
      )}
    </div>
  );
}

export default ShareReviewButton;
