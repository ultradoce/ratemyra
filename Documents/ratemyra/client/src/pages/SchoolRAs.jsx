import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import './SchoolRAs.css';

function SchoolRAs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [ras, setRAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highestRating', 'mostReviews'

  useEffect(() => {
    fetchSchool();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRAs();
    }
  }, [id, page, sortBy]);

  const fetchSchool = async () => {
    try {
      const response = await axios.get(`/api/schools/${id}`);
      setSchool(response.data);
    } catch (err) {
      setError('Failed to load school information.');
      console.error(err);
    }
  };

  const fetchRAs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/ras?schoolId=${id}&page=${page}&limit=20`);
      const rasData = response.data.ras || response.data || [];
      if (page === 1) {
        setRAs(rasData);
      } else {
        setRAs(prev => [...prev, ...rasData]);
      }
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching RAs:', err);
      setError('Failed to load RAs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  // Sort RAs based on selected option
  const sortedRAs = [...ras].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highestRating':
        return (b.rating || 0) - (a.rating || 0);
      case 'mostReviews':
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      default:
        return 0;
    }
  });

  if (loading && !school) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="container">
        <div className="error-message">{error || 'School not found'}</div>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="school-ras">
      <div className="container">
        <div className="school-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <div className="school-info">
            <h1>{school.name}</h1>
            {school.location && (
              <p className="school-location">📍 {school.location}</p>
            )}
          </div>
        </div>

        <div className="ras-header">
          <h2>All RAs at {school.name}</h2>
          {ras.length > 0 && (
            <div className="ras-sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highestRating">Highest Rating</option>
                <option value="mostReviews">Most Reviews</option>
              </select>
            </div>
          )}
        </div>

        {loading && ras.length === 0 ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Loading RAs...</p>
          </div>
        ) : ras.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No RAs yet"
            message={`No Resident Assistants have been added for ${school.name} yet.`}
            action={
              <Link to="/add-ra" className="btn btn-primary">
                Add the First RA
              </Link>
            }
          />
        ) : (
          <>
            <div className="ras-grid">
              {sortedRAs.map((ra) => (
                <Link key={ra.id} to={`/ra/${ra.id}`} className="ra-card card">
                  <div className="ra-card-header">
                    <h3>{ra.firstName} {ra.lastName}</h3>
                    {(ra.dorm || ra.floor) && (
                      <div className="ra-card-location">
                        {ra.dorm && <span>{ra.dorm}</span>}
                        {ra.dorm && ra.floor && <span> • </span>}
                        {ra.floor && <span>Floor {ra.floor}</span>}
                      </div>
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
                      <div className="metric-value">{ra.totalReviews || 0}</div>
                      <div className="metric-label">Reviews</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {pagination && page < pagination.pages && (
              <div className="load-more-container">
                <button onClick={handleLoadMore} className="btn btn-outline">
                  Load More RAs
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SchoolRAs;
