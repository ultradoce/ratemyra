import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SchoolSearch.css';

// Use configured API instance if available, otherwise use axios directly
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

function SchoolSearch({ onSelectSchool, selectedSchool, placeholder = "Enter your school to get started" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
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

  const searchSchools = async (term) => {
    if (!term || term.trim().length < 2) {
      setSchools([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/schools?q=${encodeURIComponent(term.trim())}`);
      const schoolsData = Array.isArray(response.data) ? response.data : [];
      setSchools(schoolsData);
      setShowDropdown(true);
    } catch (err) {
      console.error('School search error:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // More specific error messages
      if (err.response?.status === 404) {
        setError('Schools endpoint not found. Please check if the server is running.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to search schools. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchSchools(value);
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
            if (schools.length > 0) {
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
          {schools.map((school) => (
            <div
              key={school.id}
              className="school-search-item"
              onClick={() => handleSelectSchool(school)}
            >
              <div className="school-search-item-name">{school.name}</div>
              {school.location && (
                <div className="school-search-item-location">{school.location}</div>
              )}
              {school._count && (
                <div className="school-search-item-count">
                  {school._count.ras} {school._count.ras === 1 ? 'RA' : 'RAs'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.length >= 2 && schools.length === 0 && !loading && (
        <div ref={dropdownRef} className="school-search-dropdown">
          <div className="school-search-no-results">
            No schools found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolSearch;
