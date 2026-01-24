import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { collectDeviceFingerprint } from '../utils/deviceFingerprint';
import './RADetail.css';

function RADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ra, setRA] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [votingReviews, setVotingReviews] = useState(new Set());

  useEffect(() => {
    fetchRAData();
  }, [id]);

  const fetchRAData = async () => {
    try {
      const response = await axios.get(`/api/ras/${id}`);
      setRA(response.data);
    } catch (err) {
      setError('Failed to load RA information.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (pageNum = 1) => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`/api/reviews/${id}?page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setReviews(response.data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(response.data.reviews || [])]);
      }
      setPagination(response.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews(page);
    }
  }, [id, page]);

  const renderRating = (rating) => {
    if (!rating) return 'No rating yet';
    return `${rating.toFixed(1)}/5.0`;
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  const handleLikeReview = async (reviewId, isHelpful) => {
    if (votingReviews.has(reviewId)) return; // Prevent double-clicking
    
    setVotingReviews(prev => new Set(prev).add(reviewId));
    
    try {
      const deviceFingerprint = collectDeviceFingerprint();
      await axios.post(`/api/reviews/${reviewId}/like`, {
        isHelpful,
        deviceFingerprint,
      });
      
      // Refresh reviews to get updated counts
      fetchReviews(page);
    } catch (err) {
      console.error('Failed to vote on review:', err);
    } finally {
      setVotingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleEditReview = (reviewId) => {
    navigate(`/review/${reviewId}/edit`);
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (error || !ra) {
    return <div className="container"><p className="error">{error || 'RA not found'}</p></div>;
  }

  return (
    <div className="ra-detail">
      <div className="container">
        {/* Hero Section */}
        <div className="ra-hero">
          <div className="ra-hero-content">
            <div className="ra-name-section">
              <h1 className="ra-name">{ra.firstName} {ra.lastName}</h1>
              <div className="ra-location">
                <span className="location-icon">🏫</span>
                <span>{ra.school?.name || 'N/A'}</span>
                {ra.dorm && (
                  <>
                    <span className="location-separator">•</span>
                    <span>{ra.dorm}</span>
                  </>
                )}
                {ra.floor && (
                  <>
                    <span className="location-separator">•</span>
                    <span>Floor {ra.floor}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="ra-main-rating">
              {ra.rating ? (
                <>
                  <div className="main-rating-value">{ra.rating.toFixed(1)}</div>
                  <div className="main-rating-stars">
                    <StarRating rating={ra.rating} size="large" />
                  </div>
                  <div className="main-rating-label">Overall Quality</div>
                  <div className="main-rating-count">
                    Based on {ra.totalReviews} {ra.totalReviews === 1 ? 'student review' : 'student reviews'}
                  </div>
                </>
              ) : (
                <div className="no-rating">
                  <div className="no-rating-icon">⭐</div>
                  <div className="no-rating-text">No ratings yet</div>
                  <div className="no-rating-subtext">Be the first to rate this RA!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="ra-metrics-grid">
          {ra.wouldTakeAgainPercentage !== null && ra.wouldTakeAgainPercentage !== undefined && (
            <div className="metric-card metric-green">
              <div className="metric-icon">👍</div>
              <div className="metric-content">
                <div className="metric-value">{ra.wouldTakeAgainPercentage}%</div>
                <div className="metric-label">Would Take Again</div>
              </div>
            </div>
          )}
          {ra.averageDifficulty && (
            <div className="metric-card metric-blue">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{ra.averageDifficulty.toFixed(1)}</div>
                <div className="metric-label">Difficulty Level</div>
                <div className="metric-subtext">1.0 = Easy, 5.0 = Hard</div>
              </div>
            </div>
          )}
          <div className="metric-card metric-purple">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">{ra.totalReviews}</div>
              <div className="metric-label">Total Reviews</div>
            </div>
          </div>
        </div>

        {/* Rating Distribution & Tags Section */}
        <div className="ra-details-section">
          {ra.ratingDistribution && ra.totalReviews > 0 && (
            <div className="details-card card">
              <h3 className="details-card-title">Rating Distribution</h3>
              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ra.ratingDistribution[rating] || 0;
                  const percentage = ra.totalReviews > 0 
                    ? (count / ra.totalReviews) * 100 
                    : 0;
                  return (
                    <div key={rating} className="distribution-item">
                      <span className="dist-rating">{rating}★</span>
                      <div className="dist-bar-container">
                        <div 
                          className="dist-bar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="dist-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ra.tagStats && ra.tagStats.length > 0 && (
            <div className="details-card card">
              <h3 className="details-card-title">Student Tags</h3>
              <div className="tag-list">
                {ra.tagStats
                  .sort((a, b) => b.count - a.count)
                  .map((tagStat, idx) => (
                    <span key={idx} className="tag-badge">
                      <span className="tag-name">{tagStat.tag.replace(/_/g, ' ')}</span>
                      <span className="tag-count">{tagStat.count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="action-card card">
            <div className="action-content">
              <h3>Share Your Experience</h3>
              <p>Help other students by writing a review for this RA</p>
              <Link to={`/ra/${id}/review`} className="btn btn-primary btn-large">
                Write a Review
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Student Reviews</h2>
            <div className="reviews-count">{ra.totalReviews} {ra.totalReviews === 1 ? 'Review' : 'Reviews'}</div>
          </div>
          
          {reviews.length === 0 && !reviewsLoading ? (
            <EmptyState
              icon="📝"
              title="No reviews yet"
              message="Be the first to share your experience with this RA!"
              action={
                <Link to={`/ra/${id}/review`} className="btn btn-primary">
                  Write the First Review
                </Link>
              }
            />
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review.id} className="review-card card fade-in">
                  <div className="review-card-header">
                    <div className="review-meta-left">
                      <div className="review-date">
                        {new Date(review.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {review.semesters && review.semesters.length > 0 && (
                        <div className="review-semesters" style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-light)' }}>
                          📅 {review.semesters.join(', ')}
                        </div>
                      )}
                      {review.tags && review.tags.length > 0 && (
                        <div className="review-tags-inline" style={{ marginTop: '8px' }}>
                          {review.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag-mini">
                              {tag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="review-meta-right">
                      {review.wouldTakeAgain !== null && (
                        <div className={`would-take-badge ${review.wouldTakeAgain ? 'yes' : 'no'}`}>
                          {review.wouldTakeAgain ? '✓ Would Take Again' : '✗ Would Not Take Again'}
                        </div>
                      )}
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

                  {review.textBody && (
                    <div className="review-text-content">
                      <p>{review.textBody}</p>
                    </div>
                  )}

                  <div className="review-actions">
                    <div className="review-helpful">
                      <button
                        type="button"
                        className={`helpful-btn ${review.helpfulCount > 0 ? 'has-votes' : ''}`}
                        onClick={() => handleLikeReview(review.id, true)}
                        disabled={votingReviews.has(review.id)}
                      >
                        👍 Helpful ({review.helpfulCount || 0})
                      </button>
                      <button
                        type="button"
                        className={`not-helpful-btn ${review.notHelpfulCount > 0 ? 'has-votes' : ''}`}
                        onClick={() => handleLikeReview(review.id, false)}
                        disabled={votingReviews.has(review.id)}
                      >
                        👎 Not Helpful ({review.notHelpfulCount || 0})
                      </button>
                    </div>
                    {user && review.userId === user.id && (
                      <button
                        type="button"
                        className="edit-review-btn"
                        onClick={() => handleEditReview(review.id)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {reviewsLoading && (
                <div className="loading-reviews">
                  <LoadingSpinner size="medium" />
                </div>
              )}
              {pagination && page < pagination.pages && !reviewsLoading && (
                <div className="load-more-container">
                  <button 
                    onClick={handleLoadMore} 
                    className="btn btn-outline"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RADetail;
