import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import './RADetail.css';

function RADetail() {
  const { id } = useParams();
  const [ra, setRA] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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
        <div className="ra-header card">
          <h1>{ra.firstName} {ra.lastName}</h1>
          <div className="ra-info">
            <p><strong>School:</strong> {ra.school?.name || 'N/A'}</p>
            {ra.dorm && <p><strong>Dorm:</strong> {ra.dorm}</p>}
            {ra.floor && <p><strong>Floor:</strong> {ra.floor}</p>}
          </div>
          
          <div className="ra-stats">
            <div className="stat stat-primary">
              <div className="stat-value-large">{ra.rating ? ra.rating.toFixed(1) : 'N/A'}</div>
              <div className="stat-label">Overall Quality</div>
              {ra.rating && <StarRating rating={ra.rating} size="large" />}
            </div>
            {ra.wouldTakeAgainPercentage !== null && ra.wouldTakeAgainPercentage !== undefined && (
              <div className="stat stat-highlight">
                <div className="stat-value-large">{ra.wouldTakeAgainPercentage}%</div>
                <div className="stat-label">Would Take Again</div>
                <div className="stat-subtext">Based on {ra.totalReviews} {ra.totalReviews === 1 ? 'review' : 'reviews'}</div>
              </div>
            )}
            {ra.averageDifficulty && (
              <div className="stat">
                <div className="stat-value">{ra.averageDifficulty.toFixed(1)}</div>
                <div className="stat-label">Level of Difficulty</div>
                <div className="stat-subtext">1.0 is easiest, 5.0 is hardest</div>
              </div>
            )}
            <div className="stat">
              <div className="stat-value">{ra.totalReviews}</div>
              <div className="stat-label">Total Ratings</div>
            </div>
          </div>

          {ra.ratingDistribution && (
            <div className="rating-distribution">
              <h3>Rating Distribution</h3>
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
            <div className="tags">
              <h3>Tags</h3>
              <div className="tag-list">
                {ra.tagStats.map((tagStat, idx) => (
                  <span key={idx} className="tag">
                    {tagStat.tag.replace(/_/g, ' ')} ({tagStat.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ra-actions">
            <Link to={`/ra/${id}/review`} className="btn btn-primary">
              Write a Review
            </Link>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews ({ra.totalReviews})</h2>
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
                  <div className="review-header">
                    <div className="review-ratings">
                      <div className="rating-item">
                        <span className="rating-label">Clarity:</span>
                        <StarRating rating={review.ratingClarity} size="small" />
                        <span className="rating-value">{review.ratingClarity}/5</span>
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Helpfulness:</span>
                        <StarRating rating={review.ratingHelpfulness} size="small" />
                        <span className="rating-value">{review.ratingHelpfulness}/5</span>
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Difficulty:</span>
                        <span className="difficulty-value">{review.difficulty}/5</span>
                      </div>
                    </div>
                    <div className="review-date">
                      {new Date(review.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  {review.tags && review.tags.length > 0 && (
                    <div className="review-tags">
                      {review.tags.map((tag, idx) => (
                        <span key={idx} className="tag-small">
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  {review.textBody && (
                    <p className="review-text">{review.textBody}</p>
                  )}
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
