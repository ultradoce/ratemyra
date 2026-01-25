import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collectDeviceFingerprint } from '../utils/deviceFingerprint';
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

function SubmitStaffReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [formData, setFormData] = useState({
    ratingClarity: 5,
    ratingHelpfulness: 5,
    difficulty: 3,
    wouldTakeAgain: null,
    tags: [],
    semesters: [],
    textBody: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`/api/staff/${id}`);
      setStaff(response.data);
    } catch (err) {
      setError('Failed to load staff information.');
    }
  };

  const generateSemesterOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const semesters = [];
    const seasons = ['Fall', 'Spring', 'Summer'];
    const maxYear = 2026;
    
    for (let yearOffset = -4; yearOffset <= 2; yearOffset++) {
      const year = currentYear + yearOffset;
      
      if (year > maxYear) continue;
      
      for (const season of seasons) {
        const semesterStr = `${season} ${year}`;
        
        if (year === 2026 && season !== 'Spring') continue;
        
        if (yearOffset === 0) {
          if (season === 'Fall' && currentMonth < 8) continue;
          if (season === 'Summer' && currentMonth < 5) continue;
          if (season === 'Spring' && currentMonth < 1) continue;
          semesters.push(semesterStr);
          continue;
        }
        
        if (yearOffset < 0) {
          semesters.push(semesterStr);
        }
        
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
    
    if (formData.wouldTakeAgain === null) {
      setError('Please indicate if you would work with this staff member again.');
      return;
    }
    
    if (formData.semesters.length === 0) {
      setError('Please select at least one semester when you worked with this staff member.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const deviceFingerprint = collectDeviceFingerprint();
      
      await axios.post('/api/staff-reviews', {
        staffId: id,
        ...formData,
        ...deviceFingerprint,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/staff/${id}`);
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit review. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!staff) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (success) {
    return (
      <div className="container">
        <div className="success-animation-container">
          <div className="success-checkmark">
            <div className="checkmark-circle">
              <div className="checkmark-stem"></div>
              <div className="checkmark-kick"></div>
            </div>
          </div>
          <h2 className="success-title">Review Submitted Successfully!</h2>
          <p className="success-message-text">Thank you for sharing your experience!</p>
          <p className="success-redirect">Redirecting to staff profile...</p>
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-review">
      <div className="container">
        <h1>Review {staff.firstName} {staff.lastName}</h1>
        
        <form onSubmit={handleSubmit} className="review-form card">
          {error && <div className="error-message">{error}</div>}

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
            <label>Difficulty (1=Easy, 5=Hard) *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`rating-btn ${formData.difficulty === num ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: num }))}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Semester(s) * <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-light)' }}>Select all semesters you worked with this staff member</span></label>
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
            <label>Would Work With Again? *</label>
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
            <p className="form-help-text">Would you want to work with this staff member again?</p>
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
              maxLength={2000}
              rows={6}
              className="input"
              placeholder="Share your experience..."
            />
            <div className="char-count">{formData.textBody.length}/2000</div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/staff/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitStaffReview;
