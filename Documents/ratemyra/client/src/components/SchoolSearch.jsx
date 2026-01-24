import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './SchoolSearch.css';

function SchoolSearch({ onSelectSchool, selectedSchool, placeholder = "Enter your school to get started" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [hasCheckedDatabase, setHasCheckedDatabase] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedSchool) {
      setSearchTerm(selectedSchool.name);
    }
  }, [selectedSchool]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSchools = async (term, showAll = false) => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/schools';
      if (term && term.trim().length > 0) {
        url += `?q=${encodeURIComponent(term.trim())}`;
      } else if (showAll) {
        // Show popular schools when input is empty
        url += '?limit=50';
      } else {
        setSchools([]);
        setLoading(false);
        return;
      }

      console.log('Fetching schools from:', url);
      const response = await api.get(url);
      console.log('Schools response:', response);
      console.log('Response data:', response.data);
      
      const schoolsData = Array.isArray(response.data) ? response.data : [];
      console.log('Parsed schools data:', schoolsData);
      console.log('Number of schools:', schoolsData.length);
      
      setSchools(schoolsData);
      setHasCheckedDatabase(true);
      
      // Show dropdown if we have schools OR if we're showing "no results" message
      if (schoolsData.length > 0 || (!term && showAll)) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('School search error:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error code:', err.code);
      
      // More specific error messages
      if (err.response?.status === 503) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Database not available';
        setError(`Database not configured: ${errorMsg}. Please contact an administrator.`);
      } else if (err.response?.status === 404) {
        setError('Schools endpoint not found. Please check if the server is running.');
      } else if (err.response?.status >= 500) {
        setError(`Server error (${err.response?.status}). Please try again later.`);
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(`Failed to search schools: ${err.response?.data?.error || err.message}`);
      }
      setSchools([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Search immediately, even with 1 character
    if (value.trim().length > 0) {
      searchSchools(value, false);
    } else {
      // Show popular schools when input is cleared
      searchSchools('', true);
    }
  };

  const handleSelectSchool = (school) => {
    setSearchTerm(school.name);
    setShowDropdown(false);
    onSelectSchool(school);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSchools([]);
    setShowDropdown(false);
    onSelectSchool(null);
  };

  return (
    <div className="school-search-container">
      <div className="school-search-input-wrapper">
        <input
          ref={searchRef}
          type="text"
          className="school-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            // Show popular schools when input is focused and empty
            if (!searchTerm.trim() && schools.length === 0) {
              searchSchools('', true);
            } else if (schools.length > 0) {
              setShowDropdown(true);
            }
          }}
          autoComplete="off"
        />
        {selectedSchool && (
          <button
            type="button"
            className="school-search-clear"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
        {loading && (
          <div className="school-search-spinner">⏳</div>
        )}
      </div>

      {error && (
        <div className="school-search-error">{error}</div>
      )}

      {showDropdown && schools.length > 0 && (
        <div ref={dropdownRef} className="school-search-dropdown">
          {!searchTerm.trim() && (
            <div className="school-search-header">
              <strong>Popular Schools</strong>
              <span className="school-search-hint">Type to search...</span>
            </div>
          )}
          {schools.map((school) => (
            <div
              key={school.id}
              className="school-search-item"
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <div 
                className="school-search-item-content"
                onClick={() => handleSelectSchool(school)}
              >
                <div className="school-search-item-name">{school.name}</div>
                {school.location && (
                  <div className="school-search-item-location">{school.location}</div>
                )}
                {school._count && school._count.ras > 0 && (
                  <div className="school-search-item-count">
                    {school._count.ras} {school._count.ras === 1 ? 'RA' : 'RAs'}
                  </div>
                )}
              </div>
              {school._count && school._count.ras > 0 && (
                <Link
                  to={`/school/${school.id}/ras`}
                  className="school-view-ras-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                  }}
                >
                  View All →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.trim().length > 0 && schools.length === 0 && !loading && !error && (
        <div ref={dropdownRef} className="school-search-dropdown">
          <div className="school-search-no-results">
            No schools found matching "{searchTerm}". Try a different search term.
          </div>
        </div>
      )}

      {showDropdown && !searchTerm.trim() && schools.length === 0 && !loading && !error && hasCheckedDatabase && (
        <div ref={dropdownRef} className="school-search-dropdown">
          <div className="school-search-no-results">
            <strong>No schools in database</strong>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>
              The database appears to be empty. Please contact an administrator or use the admin dashboard to seed schools.
            </p>
          </div>
        </div>
      )}

      {error && error.includes('Database not configured') && (
        <div className="school-search-dropdown" style={{ display: 'block', position: 'relative', marginTop: '8px' }}>
          <div className="school-search-no-results" style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <strong style={{ color: '#856404', display: 'block', marginBottom: '8px' }}>
              ⚠️ Database Not Configured
            </strong>
            <p style={{ color: '#856404', fontSize: '13px', margin: 0 }}>
              The database needs to be set up. An administrator needs to add a PostgreSQL database in Railway.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolSearch;
