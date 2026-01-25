import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SchoolSearch from '../components/SchoolSearch';
import './AddRA.css';

function AddRA() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successRAId, setSuccessRAId] = useState(null);
  
  // Initialize form data from URL params if available
  const [formData, setFormData] = useState({
    firstName: searchParams.get('firstName') || '',
    lastName: searchParams.get('lastName') || '',
    schoolId: searchParams.get('schoolId') || '',
    dorm: '',
    floor: '',
  });

  // Fetch school if schoolId is in URL
  useEffect(() => {
    const schoolIdParam = searchParams.get('schoolId');
    if (schoolIdParam && schoolIdParam !== formData.schoolId) {
      fetchSchool(schoolIdParam);
    }
  }, [searchParams]);

  const fetchSchool = async (id) => {
    try {
      const response = await axios.get(`/api/schools/${id}`);
      setSelectedSchool(response.data);
      setFormData(prev => ({
        ...prev,
        schoolId: id,
      }));
    } catch (err) {
      console.error('Failed to fetch school:', err);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setFormData(prev => ({
      ...prev,
      schoolId: school ? school.id : '',
    }));
    // Clear errors when school is selected
    if (error) setError(null);
    if (potentialDuplicates) setPotentialDuplicates(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user types
    if (error) setError(null);
    if (potentialDuplicates) setPotentialDuplicates(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setPotentialDuplicates(null);

    try {
      const response = await axios.post('/api/ras', formData);
      
      // Success - show animation then redirect
      setSuccess(true);
      setSuccessRAId(response.data.id);
      setTimeout(() => {
        navigate(`/ra/${response.data.id}`);
      }, 2500);
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        
        // If exact duplicate, redirect to existing RA
        if (data.duplicate) {
          navigate(`/ra/${data.duplicate.id}`);
          return;
        }
        
        // If potential duplicates, show them for user to confirm
        if (data.potentialDuplicates) {
          setPotentialDuplicates(data.potentialDuplicates);
          setError(data.message);
          return;
        }
      }
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.errors?.[0]?.msg || 
                      'Failed to add RA. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAdd = async () => {
    // User confirms they want to add despite potential duplicates
    setPotentialDuplicates(null);
    setError(null);
    setSubmitting(true);
    
    try {
      const response = await axios.post('/api/ras', formData, {
        headers: {
          'X-Force-Create': 'true',
        },
      });
      setSuccess(true);
      setSuccessRAId(response.data.id);
      setTimeout(() => {
        navigate(`/ra/${response.data.id}`);
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.errors?.[0]?.msg || 
                      'Failed to add RA. Please try again.';
      setError(errorMsg);
      setSubmitting(false);
    }
  };

  const handleSelectDuplicate = (duplicateId) => {
    navigate(`/ra/${duplicateId}`);
  };

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
          <h2 className="success-title">RA Added Successfully!</h2>
          <p className="success-message-text">Thank you for contributing to the community!</p>
          <p className="success-redirect">Redirecting to RA profile...</p>
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
    <div className="add-ra">
      <div className="container">
        <div className="add-ra-header">
          <h1>Add a New RA</h1>
          <p className="subtitle">
            Help other students by adding a Resident Assistant to the database
          </p>
        </div>

        {error && !potentialDuplicates && (
          <div className="error-message">
            {error}
          </div>
        )}

        {potentialDuplicates && (
          <div className="duplicate-warning card">
            <h3>⚠️ Potential Duplicate Found</h3>
            <p>{error}</p>
            <div className="duplicates-list">
              {potentialDuplicates.map((dup) => (
                <div key={dup.id} className="duplicate-item">
                  <div className="duplicate-info">
                    <strong>{dup.firstName} {dup.lastName}</strong>
                    {dup.dorm && <span> • {dup.dorm}</span>}
                    {dup.floor && <span> • Floor {dup.floor}</span>}
                    <span className="similarity">({dup.similarity}% similar)</span>
                  </div>
                  <button
                    onClick={() => handleSelectDuplicate(dup.id)}
                    className="btn btn-outline btn-small"
                  >
                    View This RA
                  </button>
                </div>
              ))}
            </div>
            <div className="duplicate-actions">
              <button
                onClick={handleConfirmAdd}
                className="btn btn-primary"
              >
                No, Add New RA
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-ra-form card">
          <div className="form-group">
            <label htmlFor="schoolId">
              School <span className="required">*</span>
            </label>
            <SchoolSearch
              onSelectSchool={handleSchoolSelect}
              selectedSchool={selectedSchool}
              placeholder="Search for your school..."
            />
            {!selectedSchool && formData.schoolId && (
              <p className="form-hint" style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '8px' }}>
                Please select a school from the search results
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
                placeholder="John"
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
                placeholder="Smith"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dorm">Dorm/Hall (Optional)</label>
              <input
                type="text"
                id="dorm"
                name="dorm"
                value={formData.dorm}
                onChange={handleChange}
                className="input"
                placeholder="North Hall"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="floor">Floor (Optional)</label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="input"
                placeholder="3rd Floor"
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !formData.schoolId || !formData.firstName || !formData.lastName}
            >
              {submitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Adding RA...
                </>
              ) : (
                'Add RA'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="info-box card">
          <h3>💡 Tips</h3>
          <ul>
            <li>Make sure the RA doesn't already exist before adding</li>
            <li>Use the exact name as it appears (first and last name)</li>
            <li>Dorm and floor information helps identify the correct RA profile</li>
            <li>You can always add more details later by writing a review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddRA;
