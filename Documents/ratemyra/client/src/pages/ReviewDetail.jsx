import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import { trackPageView } from '../utils/viewTracking';
import './ReviewDetail.css';

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReview();
    // Track page view
    trackPageView('review', id);
  }, [id]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/reviews/public/${id}`);
      setReview(response.data.review);
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Review not found or is no longer available.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="container">
        <EmptyState
          icon="❌"
          title="Review not found"
          message={error || 'This review may have been removed or is no longer available.'}
          action={
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="review-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="review-detail-card card">
          <div className="review-detail-header">
            <div className="review-ra-info">
              <Link to={`/ra/${review.raId}`} className="review-ra-link">
                <h2>
                  Review for {review.ra.firstName} {review.ra.lastName}
                </h2>
                {review.ra.school && (
                  <p className="review-school">{review.ra.school.name}</p>
                )}
                {(review.ra.dorm || review.ra.floor) && (
                  <p className="review-location">
                    {review.ra.dorm}
                    {review.ra.dorm && review.ra.floor && ' • '}
                    {review.ra.floor && `Floor ${review.ra.floor}`}
                  </p>
                )}
              </Link>
            </div>
            <div className="review-date">
              {new Date(review.timestamp).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          <div className="review-ratings-grid">
            <div className="review-rating-item">
              <div className="review-rating-label">Clarity</div>
              <div className="review-rating-display">
                <StarRating rating={review.ratingClarity} size="small" />
                <span className="review-rating-number">{review.ratingClarity}/5</span>
              </div>
            </div>
            <div className="review-rating-item">
              <div className="review-rating-label">Helpfulness</div>
              <div className="review-rating-display">
                <StarRating rating={review.ratingHelpfulness} size="small" />
                <span className="review-rating-number">{review.ratingHelpfulness}/5</span>
              </div>
            </div>
            <div className="review-rating-item">
              <div className="review-rating-label">Difficulty</div>
              <div className="review-rating-display">
                <div className={`difficulty-badge difficulty-${review.difficulty}`}>
                  {review.difficulty}/5
                </div>
              </div>
            </div>
          </div>

          {review.wouldTakeAgain !== null && (
            <div className={`would-take-badge ${review.wouldTakeAgain ? 'yes' : 'no'}`}>
              {review.wouldTakeAgain ? '✓ Would Take Again' : '✗ Would Not Take Again'}
            </div>
          )}

          {review.semesters && review.semesters.length > 0 && (
            <div className="review-semesters">
              <strong>Semesters:</strong> {review.semesters.join(', ')}
            </div>
          )}

          {review.tags && review.tags.length > 0 && (
            <div className="review-tags">
              {review.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {review.textBody && (
            <div className="review-text-content">
              <p>{review.textBody}</p>
            </div>
          )}

          <div className="review-stats">
            <div className="review-stat">
              <span className="stat-label">Helpful:</span>
              <span className="stat-value">{review.helpfulCount || 0}</span>
            </div>
            <div className="review-stat">
              <span className="stat-label">Not Helpful:</span>
              <span className="stat-value">{review.notHelpfulCount || 0}</span>
            </div>
          </div>

          <div className="review-actions">
            <Link to={`/ra/${review.raId}`} className="btn btn-primary">
              View All Reviews for {review.ra.firstName} {review.ra.lastName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
