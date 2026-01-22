import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/');
      } else {
        fetchDashboard();
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Welcome, {user?.email}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.stats.totalRAs || 0}</div>
              <div className="stat-label">Total RAs</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.stats.totalReviews || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.stats.activeReviews || 0}</div>
              <div className="stat-label">Active Reviews</div>
            </div>
          </div>

          <div className="stat-card card warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.stats.flaggedReviews || 0}</div>
              <div className="stat-label">Flagged Reviews</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData?.stats.totalSchools || 0}</div>
              <div className="stat-label">Schools</div>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            className={`tab ${activeTab === 'ras' ? 'active' : ''}`}
            onClick={() => setActiveTab('ras')}
          >
            RAs
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="section-card card">
                <h2>Recent Reviews</h2>
                <div className="recent-list">
                  {dashboardData?.recentReviews?.length > 0 ? (
                    dashboardData.recentReviews.map((review) => (
                      <div key={review.id} className="recent-item">
                        <div className="recent-info">
                          <strong>
                            {review.ra.firstName} {review.ra.lastName}
                          </strong>
                          <span className={`status-badge status-${review.status.toLowerCase()}`}>
                            {review.status}
                          </span>
                        </div>
                        <div className="recent-meta">
                          {review.textBody && (
                            <p className="recent-text">{review.textBody.substring(0, 100)}...</p>
                          )}
                          <span className="recent-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent reviews</p>
                  )}
                </div>
              </div>

              <div className="section-card card">
                <h2>Recent RAs</h2>
                <div className="recent-list">
                  {dashboardData?.recentRAs?.length > 0 ? (
                    dashboardData.recentRAs.map((ra) => (
                      <div key={ra.id} className="recent-item">
                        <div className="recent-info">
                          <strong>
                            {ra.firstName} {ra.lastName}
                          </strong>
                          <span>{ra.school.name}</span>
                        </div>
                        <div className="recent-meta">
                          {ra.dorm && <span>Dorm: {ra.dorm}</span>}
                          <span className="recent-date">
                            {new Date(ra.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent RAs</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewsManagement />
          )}

          {activeTab === 'ras' && (
            <RAsManagement />
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const response = await axios.get(`/api/admin/reviews?${params}`);
      setReviews(response.data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, newStatus) => {
    try {
      await axios.patch(`/api/admin/reviews/${reviewId}/status`, { status: newStatus });
      fetchReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    
    try {
      await axios.delete(`/api/admin/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="management-section">
      <div className="filters card">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="FLAGGED">Flagged</option>
          <option value="HIDDEN">Hidden</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item card">
              <div className="review-header">
                <div>
                  <strong>{review.ra.firstName} {review.ra.lastName}</strong>
                  <span className={`status-badge status-${review.status.toLowerCase()}`}>
                    {review.status}
                  </span>
                </div>
                <div className="review-actions">
                  <select
                    value={review.status}
                    onChange={(e) => updateReviewStatus(review.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="FLAGGED">Flagged</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="btn btn-secondary btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {review.textBody && (
                <p className="review-text">{review.textBody}</p>
              )}
              <div className="review-meta">
                <span>Rating: {review.ratingOverall}/5</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RAsManagement() {
  const [ras, setRAs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRAs();
  }, []);

  const fetchRAs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/ras?limit=50');
      setRAs(response.data.ras);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRA = async (raId) => {
    if (!confirm('Are you sure you want to delete this RA and all their reviews?')) return;
    
    try {
      await axios.delete(`/api/admin/ras/${raId}`);
      fetchRAs();
    } catch (err) {
      alert('Failed to delete RA');
    }
  };

  return (
    <div className="management-section">
      {loading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <div className="ras-list">
          {ras.map((ra) => (
            <div key={ra.id} className="ra-item card">
              <div className="ra-header">
                <div>
                  <strong>{ra.firstName} {ra.lastName}</strong>
                  <span>{ra.school.name}</span>
                </div>
                <div className="ra-actions">
                  <span>{ra._count.reviews} reviews</span>
                  <button
                    onClick={() => deleteRA(ra.id)}
                    className="btn btn-secondary btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {ra.dorm && <p>Dorm: {ra.dorm}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
