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
      let htmlToImage;
      try {
        htmlToImage = await import('html-to-image');
      } catch (importError) {
        console.error('Failed to import html-to-image:', importError);
        showError('Image generation library not available. Please ensure html-to-image is installed.');
        return;
      }
      
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

      // Create the card element directly instead of using innerHTML
      const cardDiv = document.createElement('div');
      cardDiv.style.cssText = `
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        width: 720px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #333333;
        line-height: 1.6;
      `;
      cardDiv.innerHTML = cardHTML.replace(/^\s*<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      
      tempContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 800px;
        padding: 40px;
        background: #ffffff;
        z-index: 9999;
        visibility: visible;
        opacity: 1;
        pointer-events: none;
        overflow: visible;
      `;
      
      tempContainer.appendChild(cardDiv);
      document.body.appendChild(tempContainer);

      // Force a reflow and wait for rendering
      void tempContainer.offsetHeight;
      void cardDiv.offsetHeight;
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use the card div directly
      const cardElement = cardDiv;
      
      // Ensure card has explicit dimensions
      const cardHeight = Math.max(cardElement.scrollHeight, cardElement.offsetHeight, 600);
      cardElement.style.height = 'auto';
      cardElement.style.minHeight = `${cardHeight}px`;
      cardElement.style.display = 'block';
      
      // Force another reflow
      void cardElement.offsetHeight;
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate image using toBlob first to ensure it works
      let dataUrl;
      try {
        // Try toPng first
        dataUrl = await htmlToImage.toPng(cardElement, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        
        // Verify the image is not just white/empty
        if (!dataUrl || dataUrl.length < 1000) {
          throw new Error('Generated image appears to be empty');
        }
      } catch (pngError) {
        console.error('toPng failed, trying toBlob:', pngError);
        // Fallback to toBlob
        const blob = await htmlToImage.toBlob(cardElement, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        
        if (!blob) {
          throw new Error('Failed to generate image blob');
        }
        
        // Convert blob to data URL
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

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
