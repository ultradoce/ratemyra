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

function SubmitReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ra, setRA] = useState(null);
  const [formData, setFormData] = useState({
    ratingClarity: 5,
    ratingHelpfulness: 5,
    difficulty: 3,
    wouldTakeAgain: null, // null = not answered, true/false = yes/no
    tags: [],
    semesters: [], // Array of selected semesters
    attendanceRequired: false,
    textBody: '',
    courseCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRA();
  }, [id]);

  const fetchRA = async () => {
    try {
      const response = await axios.get(`/api/ras/${id}`);
      setRA(response.data);
    } catch (err) {
      setError('Failed to load RA information.');
    }
  };

  // Generate semester options (last 4 years, current year, up to Spring 2026)
  const generateSemesterOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentDay = currentDate.getDate();
    const semesters = [];
    const seasons = ['Fall', 'Spring', 'Summer'];
    const maxYear = 2026; // Cap at 2026
    const maxSemester = 'Spring 2026'; // Don't go beyond Spring 2026
    
    // Generate semesters for previous 4 years, current year, and future up to maxSemester
    for (let yearOffset = -4; yearOffset <= 2; yearOffset++) {
      const year = currentYear + yearOffset;
      
      // Don't go beyond maxYear
      if (year > maxYear) continue;
      
      for (const season of seasons) {
        const semesterStr = `${season} ${year}`;
        
        // Don't go beyond Spring 2026
        if (semesterStr === 'Summer 2026' || semesterStr === 'Fall 2026') continue;
        if (year === 2026 && season !== 'Spring') continue;
        
        // For current year, only show past and current semesters
        if (yearOffset === 0) {
          if (season === 'Fall' && currentMonth < 8) continue; // Fall starts in August
          if (season === 'Summer' && currentMonth < 5) continue; // Summer starts in May
          if (season === 'Spring' && currentMonth < 1) continue; // Spring starts in January
          // If we're currently in this semester, include it
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
    
    // Sort: most recent first
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
    
    // Validate required fields
    if (formData.wouldTakeAgain === null) {
      setError('Please indicate if you would take this RA again.');
      return;
    }
    
    if (formData.semesters.length === 0) {
      setError('Please select at least one semester when you had this RA.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      // Collect device fingerprint for abuse prevention
      const deviceFingerprint = collectDeviceFingerprint();
      
      await axios.post('/api/reviews', {
        raId: id,
        ...formData,
        ...deviceFingerprint, // Include device fingerprint data
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/ra/${id}`);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit review. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ra) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (success) {
    return (
      <div className="container">
        <div className="card success-message">
          <h2>Review submitted successfully!</h2>
          <p>Redirecting to RA profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-review">
      <div className="container">
        <h1>Review {ra.firstName} {ra.lastName}</h1>
        
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
            <p className="form-help-text">Would you want this RA again?</p>
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
            <label>
              <input
                type="checkbox"
                checked={formData.attendanceRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, attendanceRequired: e.target.checked }))}
              />
              Attendance Required
            </label>
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
              onClick={() => navigate(`/ra/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitReview;
