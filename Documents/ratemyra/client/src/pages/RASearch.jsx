import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import SchoolSearch from '../components/SchoolSearch';
import RASearchAutocomplete from '../components/RASearchAutocomplete';
import './RASearch.css';

function RASearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const schoolId = searchParams.get('schoolId');
  const query = searchParams.get('q') || '';
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedRA, setSelectedRA] = useState(null);
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSchoolSelector, setShowSchoolSelector] = useState(!!schoolId);

  // Fetch school details if schoolId is in URL
  useEffect(() => {
    if (schoolId) {
      fetchSchool(schoolId);
    }
  }, [schoolId]);

  const fetchSchool = async (id) => {
    try {
      const response = await axios.get(`/api/schools/${id}`);
      setSelectedSchool(response.data);
    } catch (err) {
      console.error('Failed to fetch school:', err);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query, schoolId);
    }
  }, [query, schoolId]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSelectedRA(null);
    setSearchTerm('');
    setResults([]);
    // Update URL with new school
    if (school) {
      navigate(`/search?schoolId=${school.id}`);
    } else {
      navigate('/search');
    }
  };

  const handleRASelect = (ra) => {
    if (ra) {
      setSelectedRA(ra);
      setSearchTerm(`${ra.firstName} ${ra.lastName}`);
      navigate(`/ra/${ra.id}`);
    }
  };

  const performSearch = async (term, schoolIdParam) => {
    const targetSchoolId = schoolIdParam || schoolId;
    
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build URL with optional schoolId
      const url = targetSchoolId
        ? `/api/search?schoolId=${targetSchoolId}&q=${encodeURIComponent(term)}`
        : `/api/search?q=${encodeURIComponent(term)}`;
      
      const response = await axios.get(url);
      setResults(response.data.results || []);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Failed to search');
      } else {
        setError('Failed to search. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      if (selectedSchool) {
        params.set('schoolId', selectedSchool.id);
      }
      params.set('q', searchTerm.trim());
      const newUrl = `/search?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
      performSearch(searchTerm.trim(), selectedSchool?.id);
    }
  };

  const renderRating = (rating) => {
    if (!rating) return 'N/A';
    return `${rating.toFixed(1)}/5.0`;
  };

  return (
    <div className="ra-search">
      <div className="container">
        <h1>Look Up an RA</h1>
        
        <div className="search-flow">
          {(selectedSchool || showSchoolSelector) && (
            <div className="school-selection">
              <label className="search-label">Select School</label>
              <SchoolSearch
                onSelectSchool={handleSchoolSelect}
                selectedSchool={selectedSchool}
                placeholder={selectedSchool 
                  ? selectedSchool.name 
                  : "Enter your school to filter results"
                }
              />
            </div>
          )}

          <div className="search-form">
            <label className="search-label">Look up an RA</label>
            <RASearchAutocomplete
              schoolId={selectedSchool?.id || null}
              selectedRA={selectedRA}
              onSelectRA={handleRASelect}
              placeholder={selectedSchool 
                ? `Look up an RA by name or dorm at ${selectedSchool.name}...`
                : "Look up an RA by name (across all schools)..."
              }
            />
          </div>

          {!selectedSchool && !showSchoolSelector && (
            <div className="alternative-search">
              <button 
                type="button"
                className="link-button"
                onClick={() => setShowSchoolSelector(true)}
              >
                + Filter by school (optional)
              </button>
            </div>
          )}
        </div>

        <div className="add-ra-cta" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div>
            <p>RA not listed yet?</p>
            <Link to="/add-ra" className="btn btn-outline">
              Add a New RA Profile
            </Link>
          </div>
          <div>
            <p>Staff member not listed yet?</p>
            <Link to="/add-staff" className="btn btn-outline">
              Add a Staff Member
            </Link>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Searching...</p>
          </div>
        )}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <EmptyState
            icon="🔍"
            title="No results found"
            message="Try searching with a different name or check your spelling."
          />
        )}

        {results.length > 0 && (
          <div className="results fade-in">
            <h2>Results ({results.length})</h2>
            <div className="results-grid">
              {results.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.type === 'staff' ? `/staff/${item.id}` : `/ra/${item.id}`} 
                  className="ra-card card"
                >
                  <div className="ra-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3>{item.firstName} {item.lastName}</h3>
                      {item.type === 'staff' && (
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px', 
                          background: '#e0e7ff', 
                          color: '#4338ca',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          Staff
                        </span>
                      )}
                    </div>
                    {item.school && (
                      <div className="ra-card-school">{item.school.name}</div>
                    )}
                  </div>
                  <div className="ra-card-metrics">
                    {item.rating ? (
                      <div className="metric metric-primary">
                        <div className="metric-value">{item.rating.toFixed(1)}</div>
                        <div className="metric-label">Overall Quality</div>
                        <StarRating rating={item.rating} size="small" />
                      </div>
                    ) : (
                      <div className="metric metric-primary">
                        <div className="metric-value">N/A</div>
                        <div className="metric-label">No ratings yet</div>
                      </div>
                    )}
                    {item.wouldTakeAgainPercentage !== null && item.wouldTakeAgainPercentage !== undefined && (
                      <div className="metric metric-highlight">
                        <div className="metric-value">{item.wouldTakeAgainPercentage}%</div>
                        <div className="metric-label">{item.type === 'staff' ? 'Would Work With Again' : 'Would Take Again'}</div>
                      </div>
                    )}
                    {item.averageDifficulty && (
                      <div className="metric">
                        <div className="metric-value">{item.averageDifficulty.toFixed(1)}</div>
                        <div className="metric-label">Difficulty</div>
                      </div>
                    )}
                    <div className="metric">
                      <div className="metric-value">{item.totalReviews || 0}</div>
                      <div className="metric-label">Reviews</div>
                    </div>
                  </div>
                  {item.type === 'ra' && (item.dorm || item.floor) && (
                    <div className="ra-card-location">
                      {item.dorm && <span>{item.dorm}</span>}
                      {item.dorm && item.floor && <span> • </span>}
                      {item.floor && <span>Floor {item.floor}</span>}
                    </div>
                  )}
                  {item.type === 'staff' && (item.department || item.title || item.office) && (
                    <div className="ra-card-location">
                      {item.department && <span>{item.department}</span>}
                      {item.department && item.title && <span> • </span>}
                      {item.title && <span>{item.title}</span>}
                      {item.office && (
                        <>
                          {(item.department || item.title) && <span> • </span>}
                          <span>{item.office}</span>
                        </>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RASearch;
