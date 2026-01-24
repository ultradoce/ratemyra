import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import './SubmitReview.css';

const REVIEW_TAGS = {
  CLEAR_COMMUNICATION: 'Clear Communication',
  HELPFUL: 'Helpful',
  RESPONSIVE: 'Responsive',
  FRIENDLY: 'Friendly',
  ORGANIZED: 'Organized',
  FAIR: 'Fair',
  SUPPORTIVE: 'Supportive',
  STRICT: 'Strict',
  UNORGANIZED: 'Unorganized',
  UNRESPONSIVE: 'Unresponsive',
  HARSH: 'Harsh',
};

function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [ra, setRA] = useState(null);
  const [formData, setFormData] = useState({
    ratingClarity: 5,
    ratingHelpfulness: 5,
    difficulty: 3,
    wouldTakeAgain: null,
    tags: [],
    textBody: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReview();
  }, [id, user]);

  const fetchReview = async () => {
    try {
      // Get review details
      const response = await axios.get(`/api/reviews/single/${id}`);
      const reviewData = response.data.review;
      
      if (!reviewData) {
        setError('Review not found');
        return;
      }

      if (reviewData.userId !== user.id) {
        setError('You can only edit your own reviews');
        return;
      }

      setReview(reviewData);
      setFormData({
        ratingClarity: reviewData.ratingClarity,
        ratingHelpfulness: reviewData.ratingHelpfulness,
        difficulty: reviewData.difficulty,
        wouldTakeAgain: reviewData.wouldTakeAgain,
        tags: reviewData.tags || [],
        textBody: reviewData.textBody || '',
      });

      // Fetch RA info
      const raResponse = await axios.get(`/api/ras/${reviewData.raId}`);
      setRA(raResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load review');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.patch(`/api/reviews/${id}`, formData);
      navigate(`/ra/${review.raId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="submit-review">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="container">
        <div className="submit-review">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-review">
      <div className="container">
        <h1>Edit Your Review</h1>
        {ra && (
          <div className="review-ra-info">
            <h2>{ra.firstName} {ra.lastName}</h2>
            {ra.school && <p>{ra.school.name}</p>}
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form card">
          <div className="form-group">
            <label>Clarity Rating *</label>
            <div className="rating-input">
              <StarRating
                rating={formData.ratingClarity}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, ratingClarity: rating }))}
                interactive
              />
              <span className="rating-value">{formData.ratingClarity}/5</span>
            </div>
          </div>

          <div className="form-group">
            <label>Helpfulness Rating *</label>
            <div className="rating-input">
              <StarRating
                rating={formData.ratingHelpfulness}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, ratingHelpfulness: rating }))}
                interactive
              />
              <span className="rating-value">{formData.ratingHelpfulness}/5</span>
            </div>
          </div>

          <div className="form-group">
            <label>Difficulty Level *</label>
            <div className="difficulty-input">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`difficulty-btn ${formData.difficulty === level ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="form-help-text">1 = Very Easy, 5 = Very Difficult</p>
          </div>

          <div className="form-group">
            <label>Would Take Again? *</label>
            <div className="would-take-again-input">
              <button
                type="button"
                className={`wta-btn ${formData.wouldTakeAgain === true ? 'active yes' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, wouldTakeAgain: true }))}
              >
                ✓ Yes
              </button>
              <button
                type="button"
                className={`wta-btn ${formData.wouldTakeAgain === false ? 'active no' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, wouldTakeAgain: false }))}
              >
                ✗ No
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (select all that apply)</label>
            <div className="tags-grid">
              {Object.entries(REVIEW_TAGS).map(([key, label]) => (
                <label key={key} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(key)}
                    onChange={() => handleTagToggle(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Review Text (optional, max 2000 characters)</label>
            <textarea
              value={formData.textBody}
              onChange={(e) => setFormData(prev => ({ ...prev, textBody: e.target.value }))}
              className="textarea"
              rows={6}
              maxLength={2000}
              placeholder="Share your experience with this RA..."
            />
            <p className="form-help-text">{formData.textBody.length}/2000 characters</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/ra/${review.raId}`)}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || formData.wouldTakeAgain === null}
            >
              {submitting ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReview;
