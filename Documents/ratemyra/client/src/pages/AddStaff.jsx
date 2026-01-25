import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SchoolSearch from '../components/SchoolSearch';
import './AddStaff.css';

function AddStaff() {
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successStaffId, setSuccessStaffId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    schoolId: '',
    department: '',
    title: '',
    office: '',
  });

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setFormData(prev => ({
      ...prev,
      schoolId: school ? school.id : '',
    }));
    if (error) setError(null);
    if (potentialDuplicates) setPotentialDuplicates(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
    if (potentialDuplicates) setPotentialDuplicates(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setPotentialDuplicates(null);

    try {
      const response = await axios.post('/api/staff', formData);
      
      setSuccess(true);
      setSuccessStaffId(response.data.id);
      setTimeout(() => {
        navigate(`/staff/${response.data.id}`);
      }, 2500);
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        
        if (data.duplicate) {
          navigate(`/staff/${data.duplicate.id}`);
          return;
        }
      }
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.errors?.[0]?.msg || 
                      'Failed to add staff member. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
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
          <h2 className="success-title">Staff Member Added Successfully!</h2>
          <p className="success-message-text">Thank you for contributing to the community!</p>
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
    <div className="add-staff">
      <div className="container">
        <div className="add-staff-header">
          <h1>Add a Professional Staff Member</h1>
          <p className="subtitle">
            Help other students by adding a professional staff member to the database
          </p>
        </div>

        {error && !potentialDuplicates && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-staff-form card">
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
                placeholder="Jane"
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
                placeholder="Doe"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department (Optional)</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input"
                placeholder="Residence Life"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title (Optional)</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Residence Director"
                maxLength={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="office">Office Location (Optional)</label>
            <input
              type="text"
              id="office"
              name="office"
              value={formData.office}
              onChange={handleChange}
              className="input"
              placeholder="Student Center, Room 201"
              maxLength={100}
            />
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
                  Adding Staff Member...
                </>
              ) : (
                'Add Staff Member'
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
            <li>Make sure the staff member doesn't already exist before adding</li>
            <li>Use the exact name as it appears (first and last name)</li>
            <li>Department, title, and office information helps identify the correct staff member</li>
            <li>You can always add more details later by writing a review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddStaff;
