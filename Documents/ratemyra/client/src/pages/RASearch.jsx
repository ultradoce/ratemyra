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
              {results.map((ra) => (
                <Link key={ra.id} to={`/ra/${ra.id}`} className="ra-card card">
                  <div className="ra-card-header">
                    <h3>{ra.firstName} {ra.lastName}</h3>
                    {ra.school && (
                      <div className="ra-card-school">{ra.school.name}</div>
                    )}
                  </div>
                  <div className="ra-card-metrics">
                    {ra.rating ? (
                      <div className="metric metric-primary">
                        <div className="metric-value">{ra.rating.toFixed(1)}</div>
                        <div className="metric-label">Overall Quality</div>
                        <StarRating rating={ra.rating} size="small" />
                      </div>
                    ) : (
                      <div className="metric metric-primary">
                        <div className="metric-value">N/A</div>
                        <div className="metric-label">No ratings yet</div>
                      </div>
                    )}
                    {ra.wouldTakeAgainPercentage !== null && ra.wouldTakeAgainPercentage !== undefined && (
                      <div className="metric metric-highlight">
                        <div className="metric-value">{ra.wouldTakeAgainPercentage}%</div>
                        <div className="metric-label">Would Take Again</div>
                      </div>
                    )}
                    {ra.averageDifficulty && (
                      <div className="metric">
                        <div className="metric-value">{ra.averageDifficulty.toFixed(1)}</div>
                        <div className="metric-label">Difficulty</div>
                      </div>
                    )}
                    <div className="metric">
                      <div className="metric-value">{ra.totalReviews}</div>
                      <div className="metric-label">Ratings</div>
                    </div>
                  </div>
                  {(ra.dorm || ra.floor) && (
                    <div className="ra-card-location">
                      {ra.dorm && <span>{ra.dorm}</span>}
                      {ra.dorm && ra.floor && <span> • </span>}
                      {ra.floor && <span>Floor {ra.floor}</span>}
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
