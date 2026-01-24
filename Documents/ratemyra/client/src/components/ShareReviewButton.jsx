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
      
      // Build a custom HTML structure for the review card
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      };

      const formatTag = (tag) => tag.replace(/_/g, ' ');

      const tempContainer = document.createElement('div');
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '40px';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      tempContainer.style.color = '#333333';
      tempContainer.style.lineHeight = '1.6';
      
      // Create review card HTML
      const cardHTML = `
        <div style="
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          width: 100%;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e0e0e0;
          ">
            <div>
              <div style="
                font-size: 14px;
                color: #666666;
                font-weight: 500;
                margin-bottom: 8px;
              ">${formatDate(review.timestamp)}</div>
              ${review.semesters && review.semesters.length > 0 ? `
                <div style="
                  font-size: 13px;
                  color: #999999;
                  margin-top: 4px;
                ">📅 ${review.semesters.join(', ')}</div>
              ` : ''}
              ${review.tags && review.tags.length > 0 ? `
                <div style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  margin-top: 8px;
                ">
                  ${review.tags.slice(0, 3).map(tag => `
                    <span style="
                      background: #f5f5f5;
                      padding: 4px 10px;
                      border-radius: 12px;
                      font-size: 11px;
                      color: #333333;
                      font-weight: 500;
                      border: 1px solid #e0e0e0;
                      text-transform: capitalize;
                    ">${formatTag(tag)}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            ${review.wouldTakeAgain !== null ? `
              <div style="
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                ${review.wouldTakeAgain 
                  ? 'background: #dcfce7; color: #166534;' 
                  : 'background: #fee2e2; color: #991b1b;'
                }
              ">
                ${review.wouldTakeAgain ? '✓ Would Take Again' : '✗ Would Not Take Again'}
              </div>
            ` : ''}
          </div>

          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 20px;
          ">
            <div style="text-align: center;">
              <div style="
                font-size: 14px;
                color: #666666;
                margin-bottom: 8px;
                font-weight: 500;
              ">Clarity</div>
              <div style="
                font-size: 24px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 4px;
              ">${review.ratingClarity}/5</div>
              <div style="color: #ffc107; font-size: 18px;">
                ${'★'.repeat(review.ratingClarity)}${'☆'.repeat(5 - review.ratingClarity)}
              </div>
            </div>
            <div style="text-align: center;">
              <div style="
                font-size: 14px;
                color: #666666;
                margin-bottom: 8px;
                font-weight: 500;
              ">Helpfulness</div>
              <div style="
                font-size: 24px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 4px;
              ">${review.ratingHelpfulness}/5</div>
              <div style="color: #ffc107; font-size: 18px;">
                ${'★'.repeat(review.ratingHelpfulness)}${'☆'.repeat(5 - review.ratingHelpfulness)}
              </div>
            </div>
            <div style="text-align: center;">
              <div style="
                font-size: 14px;
                color: #666666;
                margin-bottom: 8px;
                font-weight: 500;
              ">Difficulty</div>
              <div style="
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 18px;
                display: inline-block;
                ${review.difficulty <= 2 
                  ? 'background: #d1fae5; color: #065f46;' 
                  : review.difficulty === 3
                  ? 'background: #fef3c7; color: #92400e;'
                  : 'background: #fee2e2; color: #991b1b;'
                }
              ">${review.difficulty}/5</div>
            </div>
          </div>

          ${review.textBody ? `
            <div style="
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            ">
              <p style="
                line-height: 1.8;
                color: #333333;
                font-size: 15px;
                margin: 0;
              ">${review.textBody}</p>
            </div>
          ` : ''}

          <div style="
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 24px;
            font-size: 14px;
            color: #666666;
          ">
            <div>
              <span style="font-weight: 500;">Helpful:</span>
              <span style="margin-left: 4px; font-weight: 600; color: #333;">${review.helpfulCount || 0}</span>
            </div>
            <div>
              <span style="font-weight: 500;">Not Helpful:</span>
              <span style="margin-left: 4px; font-weight: 600; color: #333;">${review.notHelpfulCount || 0}</span>
            </div>
          </div>

          ${ra ? `
            <div style="
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
            ">
              <div style="
                font-size: 18px;
                font-weight: 700;
                color: #333333;
                margin-bottom: 4px;
              ">${ra.firstName} ${ra.lastName}</div>
              ${ra.school ? `
                <div style="
                  font-size: 14px;
                  color: #666666;
                ">${ra.school.name}</div>
              ` : ''}
              <div style="
                margin-top: 16px;
                font-size: 12px;
                color: #999999;
              ">RateMyRA.com</div>
            </div>
          ` : ''}
        </div>
      `;

      tempContainer.innerHTML = cardHTML;
      // Position off-screen but visible for rendering
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-10000px';
      tempContainer.style.left = '0';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.visibility = 'visible';
      tempContainer.style.opacity = '1';
      tempContainer.style.pointerEvents = 'none';
      
      document.body.appendChild(tempContainer);

      // Wait for fonts and rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate image - target the inner card div directly
      const cardElement = tempContainer.querySelector('div > div');
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const dataUrl = await htmlToImage.toPng(cardElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: 800,
        height: cardElement.scrollHeight,
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
