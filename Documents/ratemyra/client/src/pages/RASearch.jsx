import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import './RASearch.css';

function RASearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(term)}`);
      setResults(response.data.results || []);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm.trim())}`);
      performSearch(searchTerm.trim());
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
        
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search by name or dorm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

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
                    {ra.rating && (
                      <div className="rating-container">
                        <StarRating rating={ra.rating} size="small" showNumber />
                      </div>
                    )}
                  </div>
                  <div className="ra-card-details">
                    <div className="detail-item">
                      <span className="detail-label">School:</span>
                      <span className="detail-value">{ra.school?.name || 'N/A'}</span>
                    </div>
                    {ra.dorm && (
                      <div className="detail-item">
                        <span className="detail-label">Dorm:</span>
                        <span className="detail-value">{ra.dorm}</span>
                      </div>
                    )}
                    {ra.floor && (
                      <div className="detail-item">
                        <span className="detail-label">Floor:</span>
                        <span className="detail-value">{ra.floor}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Reviews:</span>
                      <span className="detail-value">{ra.totalReviews}</span>
                    </div>
                  </div>
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
