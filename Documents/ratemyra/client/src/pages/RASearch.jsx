import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import SchoolSearch from '../components/SchoolSearch';
import './RASearch.css';

function RASearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const schoolId = searchParams.get('schoolId');
  const query = searchParams.get('q') || '';
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (query && schoolId) {
      performSearch(query, schoolId);
    }
  }, [query, schoolId]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSearchTerm('');
    setResults([]);
    // Update URL with new school
    if (school) {
      navigate(`/search?schoolId=${school.id}`);
    } else {
      navigate('/search');
    }
  };

  const performSearch = async (term, schoolIdParam) => {
    const targetSchoolId = schoolIdParam || schoolId;
    
    if (!targetSchoolId) {
      setError('Please select a school first');
      return;
    }

    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/search?schoolId=${targetSchoolId}&q=${encodeURIComponent(term)}`);
      setResults(response.data.results || []);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Please select a school first');
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
    if (!selectedSchool) {
      setError('Please select a school first');
      return;
    }
    if (searchTerm.trim()) {
      const newUrl = `/search?schoolId=${selectedSchool.id}&q=${encodeURIComponent(searchTerm.trim())}`;
      window.history.pushState({}, '', newUrl);
      performSearch(searchTerm.trim(), selectedSchool.id);
    }
  };

  const renderRating = (rating) => {
    if (!rating) return 'N/A';
    return `${rating.toFixed(1)}/5.0`;
  };

  return (
    <div className="ra-search">
      <div className="container">
        <h1>Search RAs</h1>
        
        <div className="search-flow">
          <div className="school-selection">
            <label className="search-label">Select School</label>
            <SchoolSearch
              onSelectSchool={handleSchoolSelect}
              selectedSchool={selectedSchool}
              placeholder="Enter your school to get started"
            />
          </div>

          {selectedSchool && (
            <form onSubmit={handleSubmit} className="search-form">
              <label className="search-label">Search for an RA</label>
              <div className="ra-search-wrapper">
                <input
                  type="text"
                  placeholder={`Search by name or dorm at ${selectedSchool.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="btn btn-primary" disabled={!searchTerm.trim()}>
                  Search
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="add-ra-cta">
          <p>Can't find the RA you're looking for?</p>
          <Link to="/add-ra" className="btn btn-outline">
            Add a New RA
          </Link>
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
            title="No RAs found"
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
