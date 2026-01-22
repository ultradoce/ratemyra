import React from 'react';
import './StarRating.css';

function StarRating({ rating, size = 'medium', showNumber = false }) {
  if (!rating) return null;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </div>
      {showNumber && (
        <span className="rating-number">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
