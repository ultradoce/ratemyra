import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import StarRating from './StarRating';
import './RASearchAutocomplete.css';

function RASearchAutocomplete({ schoolId = null, selectedRA, onSelectRA, placeholder = "Look up an RA..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ras, setRAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedRA) {
      setSearchTerm(`${selectedRA.firstName} ${selectedRA.lastName}`);
    } else {
      setSearchTerm('');
    }
  }, [selectedRA]);

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

  const searchRAs = async (term) => {
    // Allow searches with at least 1 character
    if (!term || term.trim().length < 1) {
      setRAs([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build URL with optional schoolId
      const url = schoolId 
        ? `/api/search?schoolId=${schoolId}&q=${encodeURIComponent(term.trim())}&limit=10`
        : `/api/search?q=${encodeURIComponent(term.trim())}&limit=10`;
      
      const response = await api.get(url);
      const results = response.data.results || [];
      
      setRAs(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      console.error('RA search error:', err);
      setRAs([]);
      setShowDropdown(false);
      if (err.response?.status !== 400) {
        setError('Failed to search RAs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce search
    if (value.trim().length > 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        searchRAs(value);
      }, 300);
    } else {
      setRAs([]);
      setShowDropdown(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectRA = (ra) => {
    setSearchTerm(`${ra.firstName} ${ra.lastName}`);
    setShowDropdown(false);
    if (onSelectRA) {
      onSelectRA(ra);
    } else {
      // Default: navigate to RA profile
      navigate(`/ra/${ra.id}`);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setRAs([]);
    setShowDropdown(false);
    if (onSelectRA) {
      onSelectRA(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && ras.length > 0) {
      e.preventDefault();
      handleSelectRA(ras[0]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="ra-search-autocomplete">
      <div className="ra-search-input-wrapper">
        <input
          ref={searchRef}
          type="text"
          className="ra-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (ras.length > 0) {
              setShowDropdown(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {selectedRA && (
          <button
            type="button"
            className="ra-search-clear"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
        {loading && (
          <div className="ra-search-spinner">⏳</div>
        )}
      </div>

      {error && (
        <div className="ra-search-error">{error}</div>
      )}

      {showDropdown && ras.length > 0 && (
        <div ref={dropdownRef} className="ra-search-dropdown">
          {ras.map((ra) => (
            <div
              key={ra.id}
              className="ra-search-item"
              onClick={() => handleSelectRA(ra)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <div className="ra-search-item-header">
                <div className="ra-search-item-name">
                  {ra.firstName} {ra.lastName}
                </div>
                {ra.rating && (
                  <div className="ra-search-item-rating">
                    <StarRating rating={ra.rating} size="small" />
                    <span className="ra-search-rating-value">{ra.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="ra-search-item-details">
                {ra.dorm && <span className="ra-search-detail">{ra.dorm}</span>}
                {ra.dorm && ra.floor && <span className="ra-search-separator">•</span>}
                {ra.floor && <span className="ra-search-detail">Floor {ra.floor}</span>}
                {ra.totalReviews > 0 && (
                  <>
                    {(ra.dorm || ra.floor) && <span className="ra-search-separator">•</span>}
                    <span className="ra-search-detail">{ra.totalReviews} {ra.totalReviews === 1 ? 'review' : 'reviews'}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.trim().length > 0 && ras.length === 0 && !loading && !error && (
        <div ref={dropdownRef} className="ra-search-dropdown">
          <div className="ra-search-no-results">
            <div style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px 0', color: 'var(--text-light)' }}>
                No RAs found matching "{searchTerm}"
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '14px', padding: '8px 16px' }}
                onClick={() => {
                  // Parse name from search term (simple: assume first word is first name, rest is last name)
                  const nameParts = searchTerm.trim().split(/\s+/);
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '';
                  
                  // Navigate to add RA page with pre-filled data
                  const params = new URLSearchParams();
                  if (firstName) params.set('firstName', firstName);
                  if (lastName) params.set('lastName', lastName);
                  if (schoolId) params.set('schoolId', schoolId);
                  navigate(`/add-ra?${params.toString()}`);
                  setShowDropdown(false);
                }}
              >
                ➕ Add "{searchTerm}" as a New RA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RASearchAutocomplete;
