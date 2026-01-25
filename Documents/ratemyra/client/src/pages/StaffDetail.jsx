import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import { collectDeviceFingerprint } from '../utils/deviceFingerprint';
import { useToast } from '../hooks/useToast.jsx';
import { usePageMeta } from '../components/PageMeta';
import ShareReviewButton from '../components/ShareReviewButton';
import './StaffDetail.css';

function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [votingReviews, setVotingReviews] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const { success: showSuccess, error: showError, ToastContainer } = useToast();

  useEffect(() => {
    fetchStaffData();
  }, [id]);

  usePageMeta(
    staff ? `${staff.firstName} ${staff.lastName} - Staff Reviews` : 'Staff Profile',
    staff ? `Read reviews and ratings for ${staff.firstName} ${staff.lastName} at ${staff.school?.name || 'their school'}. ${staff.totalReviews} student reviews.` : 'View staff profile and reviews',
    'https://ratemyra.com/favicon.png'
  );

  const fetchStaffData = async () => {
    try {
      const response = await axios.get(`/api/staff/${id}`);
      setStaff(response.data);
    } catch (err) {
      setError('Failed to load staff information.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (pageNum = 1) => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`/api/staff-reviews/${id}?page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setReviews(response.data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(response.data.reviews || [])]);
      }
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews(page);
    }
  }, [id, page]);

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  const handleLikeReview = async (reviewId, isHelpful) => {
    if (votingReviews.has(reviewId)) return;
    
    setVotingReviews(prev => new Set(prev).add(reviewId));
    
    try {
      const deviceFingerprint = collectDeviceFingerprint();
      await axios.post(`/api/staff-reviews/${reviewId}/like`, {
        isHelpful,
        deviceFingerprint,
      });
      
      fetchReviews(page);
      showSuccess('Thank you for your feedback!');
    } catch (err) {
      console.error('Failed to vote on review:', err);
      showError('Failed to submit vote. Please try again.');
    } finally {
      setVotingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleShareStaff = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showSuccess('Link copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess('Link copied to clipboard!');
      } catch (e) {
        showError('Failed to copy link. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const sortedReviews = useMemo(() => {
    const reviewsCopy = [...reviews];
    switch (sortBy) {
      case 'newest':
        return reviewsCopy.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'oldest':
        return reviewsCopy.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      case 'mostHelpful':
        return reviewsCopy.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      case 'highestRating':
        return reviewsCopy.sort((a, b) => (b.ratingOverall || b.ratingClarity || 0) - (a.ratingOverall || a.ratingClarity || 0));
      case 'lowestRating':
        return reviewsCopy.sort((a, b) => (a.ratingOverall || a.ratingClarity || 0) - (b.ratingOverall || b.ratingClarity || 0));
      default:
        return reviewsCopy;
    }
  }, [reviews, sortBy]);

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (error || !staff) {
    return <div className="container"><p className="error">{error || 'Staff member not found'}</p></div>;
  }

  return (
    <div className="staff-detail">
      <div className="container">
        <div className="staff-hero">
          <div className="staff-hero-content">
            <div className="staff-name-section">
              <h1 className="staff-name">{staff.firstName} {staff.lastName}</h1>
              <div className="staff-location">
                <span className="location-icon">🏫</span>
                <span>{staff.school?.name || 'N/A'}</span>
                {staff.department && (
                  <>
                    <span className="location-separator">•</span>
                    <span>{staff.department}</span>
                  </>
                )}
                {staff.title && (
                  <>
                    <span className="location-separator">•</span>
                    <span>{staff.title}</span>
                  </>
                )}
                {staff.office && (
                  <>
                    <span className="location-separator">•</span>
                    <span>{staff.office}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="staff-main-rating">
              {staff.rating ? (
                <>
                  <div className="main-rating-value">{staff.rating.toFixed(1)}</div>
                  <div className="main-rating-stars">
                    <StarRating rating={staff.rating} size="large" />
                  </div>
                  <div className="main-rating-label">Overall Quality</div>
                  <div className="main-rating-count">
                    Based on {staff.totalReviews} {staff.totalReviews === 1 ? 'student review' : 'student reviews'}
                  </div>
                </>
              ) : (
                <div className="no-rating">
                  <div className="no-rating-icon">⭐</div>
                  <div className="no-rating-text">No ratings yet</div>
                  <div className="no-rating-subtext">Be the first to rate this staff member!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="staff-metrics-grid">
          {staff.wouldTakeAgainPercentage !== null && staff.wouldTakeAgainPercentage !== undefined && (
            <div className="metric-card metric-green">
              <div className="metric-icon">👍</div>
              <div className="metric-content">
                <div className="metric-value">{staff.wouldTakeAgainPercentage}%</div>
                <div className="metric-label">Would Work With Again</div>
              </div>
            </div>
          )}
          {staff.averageDifficulty && (
            <div className="metric-card metric-blue">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{staff.averageDifficulty.toFixed(1)}</div>
                <div className="metric-label">Difficulty Level</div>
                <div className="metric-subtext">1.0 = Easy, 5.0 = Hard</div>
              </div>
            </div>
          )}
          <div className="metric-card metric-purple">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">{staff.totalReviews}</div>
              <div className="metric-label">Total Reviews</div>
            </div>
          </div>
        </div>

        <div className="staff-details-section">
          {staff.ratingDistribution && staff.totalReviews > 0 && (
            <div className="details-card card">
              <h3 className="details-card-title">Rating Distribution</h3>
              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = staff.ratingDistribution[rating] || 0;
                  const percentage = staff.totalReviews > 0 
                    ? (count / staff.totalReviews) * 100 
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

          <div className="action-card card">
            <div className="action-content">
              <h3>Share Your Experience</h3>
              <p>Help other students by writing a review for this staff member</p>
              <div className="action-buttons">
                <Link to={`/staff/${id}/review`} className="btn btn-primary btn-large">
                  Write a Review
                </Link>
                <button onClick={handleShareStaff} className="btn btn-outline btn-large">
                  📋 Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <div className="reviews-header-left">
              <h2>Student Reviews</h2>
              <div className="reviews-count">{staff.totalReviews} {staff.totalReviews === 1 ? 'Review' : 'Reviews'}</div>
            </div>
            {reviews.length > 0 && (
              <div className="reviews-sort">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostHelpful">Most Helpful</option>
                  <option value="highestRating">Highest Rating</option>
                  <option value="lowestRating">Lowest Rating</option>
                </select>
              </div>
            )}
          </div>
          
          {reviews.length === 0 && !reviewsLoading ? (
            <EmptyState
              icon="📝"
              title="No reviews yet"
              message="Be the first to share your experience with this staff member!"
              action={
                <Link to={`/staff/${id}/review`} className="btn btn-primary">
                  Write the First Review
                </Link>
              }
            />
          ) : (
            <>
              {sortedReviews.map((review) => (
                <div key={review.id} data-review-id={review.id} className="review-card card fade-in">
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
                          {review.wouldTakeAgain ? '✓ Would Work With Again' : '✗ Would Not Work With Again'}
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
                    <ShareReviewButton review={review} ra={staff} />
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
      <ToastContainer />
    </div>
  );
}

export default StaffDetail;
