import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
  // Generate semester options (same as SubmitReview) - up to Spring 2026
  // Future semesters are automatically included as time progresses
  const generateSemesterOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const semesters = [];
    const seasons = ['Fall', 'Spring', 'Summer'];
    const maxYear = 2026; // Hard cap at 2026
    
    for (let yearOffset = -4; yearOffset <= 2; yearOffset++) {
      const year = currentYear + yearOffset;
      
      // Don't go beyond maxYear
      if (year > maxYear) continue;
      
      for (const season of seasons) {
        const semesterStr = `${season} ${year}`;
        
        // Hard cap: Don't go beyond Spring 2026
        if (year === 2026 && season !== 'Spring') continue;
        
        // For current year, only show past and current semesters
        if (yearOffset === 0) {
          if (season === 'Fall' && currentMonth < 8) continue;
          if (season === 'Summer' && currentMonth < 5) continue;
          if (season === 'Spring' && currentMonth < 1) continue;
          semesters.push(semesterStr);
          continue;
        }
        
        // For past years, show all semesters
        if (yearOffset < 0) {
          semesters.push(semesterStr);
        }
        
        // For future years (up to maxYear), show all semesters
        // These will automatically appear as time progresses
        if (yearOffset > 0 && year <= maxYear) {
          semesters.push(semesterStr);
        }
      }
    }
    
    return semesters.sort((a, b) => {
      const [seasonA, yearA] = a.split(' ');
      const [seasonB, yearB] = b.split(' ');
      const yearDiff = parseInt(yearB) - parseInt(yearA);
      if (yearDiff !== 0) return yearDiff;
      const seasonOrder = { Fall: 3, Summer: 2, Spring: 1 };
      return seasonOrder[seasonB] - seasonOrder[seasonA];
    });
  };

  const semesterOptions = generateSemesterOptions();

  const [formData, setFormData] = useState({
    ratingClarity: 5,
    ratingHelpfulness: 5,
    difficulty: 3,
    wouldTakeAgain: null,
    tags: [],
    semesters: [],
    textBody: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      // Editing requires authentication, but public login is no longer available
      setError('Review editing is not available. Reviews cannot be edited after submission.');
      setLoading(false);
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }
    fetchReview();
  }, [id, user, navigate]);

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
        semesters: reviewData.semesters || [],
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

  const handleSemesterToggle = (semester) => {
    setFormData(prev => ({
      ...prev,
      semesters: prev.semesters.includes(semester)
        ? prev.semesters.filter(s => s !== semester)
        : [...prev.semesters, semester],
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
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`rating-btn ${formData.ratingClarity === num ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, ratingClarity: num }))}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Helpfulness Rating *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`rating-btn ${formData.ratingHelpfulness === num ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, ratingHelpfulness: num }))}
                >
                  {num}
                </button>
              ))}
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
            <label>Semester(s) * <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-light)' }}>Select all semesters you had this RA</span></label>
            <div className="tags-grid" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
              {semesterOptions.map((semester) => (
                <label key={semester} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.semesters.includes(semester)}
                    onChange={() => handleSemesterToggle(semester)}
                  />
                  <span>{semester}</span>
                </label>
              ))}
            </div>
            {formData.semesters.length > 0 && (
              <p className="form-help-text" style={{ marginTop: '8px', color: 'var(--primary)' }}>
                Selected: {formData.semesters.join(', ')}
              </p>
            )}
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
              disabled={submitting || formData.wouldTakeAgain === null || formData.semesters.length === 0}
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
