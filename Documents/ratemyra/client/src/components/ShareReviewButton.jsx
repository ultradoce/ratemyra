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
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '40px';
      tempContainer.style.background = 'white';
      tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      // Clone the review card content
      const clonedCard = reviewCard.cloneNode(true);
      clonedCard.style.width = '100%';
      clonedCard.style.margin = '0';
      clonedCard.style.boxShadow = 'none';
      clonedCard.style.border = 'none';
      
      // Remove action buttons from cloned content
      const actions = clonedCard.querySelector('.review-actions');
      if (actions) actions.remove();
      
      tempContainer.appendChild(clonedCard);
      document.body.appendChild(tempContainer);

      // Generate image
      const dataUrl = await htmlToImage.toPng(tempContainer, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'white',
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
