import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';
import '../pages/Login.css';

function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Login form state
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Don't navigate, show login form instead
        setLoading(false);
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const result = await login(loginFormData.email, loginFormData.password);

    if (result.success) {
      if (result.user?.role !== 'ADMIN') {
        setLoginError('Access denied. Admin privileges required.');
        logout();
      } else {
        // Login successful, will trigger useEffect to fetch dashboard
        setLoginFormData({ email: '', password: '' });
      }
    } else {
      setLoginError(result.error);
    }
    setLoginLoading(false);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (loginError) setLoginError(null);
  };

  if (authLoading) {
    return (
      <div className="container">
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  // Show login form if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card card">
            <h1>Admin Login</h1>
            <p className="login-subtitle">Sign in to access the admin dashboard</p>

            {loginError && (
              <div className="error-message">{loginError}</div>
            )}

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="admin-email">Email</label>
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  value={loginFormData.email}
                  onChange={handleLoginChange}
                  className="input"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="login-footer">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="link-button"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
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
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="btn btn-outline"
            style={{ alignSelf: 'flex-start' }}
          >
            💬 Get Help
          </button>
        </div>

        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} userEmail={user?.email} />
        )}

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

          {dashboardData?.stats.unreadHelpMessages > 0 && (
            <div className="stat-card card warning">
              <div className="stat-icon">📬</div>
              <div className="stat-content">
                <div className="stat-value">{dashboardData?.stats.unreadHelpMessages || 0}</div>
                <div className="stat-label">Unread Help Messages</div>
              </div>
            </div>
          )}
        </div>

        {dashboardData?.stats.totalSchools === 0 && (
          <div className="alert-card card" style={{ 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '2px solid #ffc107',
            padding: '24px',
            marginBottom: '32px',
            borderRadius: '12px'
          }}>
            <h3 style={{ marginTop: 0, color: '#856404' }}>⚠️ No Schools in Database</h3>
            <p style={{ color: '#856404', marginBottom: '16px' }}>
              The database is empty. Click the button below to add 100+ major US colleges and universities.
            </p>
            <SeedSchoolsButton onSuccess={fetchDashboard} />
          </div>
        )}

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
          <button
            className={`tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            Help Messages
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

          {activeTab === 'help' && (
            <HelpMessagesManagement />
          )}
        </div>
      </div>
    </div>
  );
}

function SeedSchoolsButton({ onSuccess }) {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/admin/seed-schools');
      setResult(response.data);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to seed schools');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="btn btn-primary"
        style={{ marginRight: '12px' }}
      >
        {seeding ? (
          <>
            <span className="loading-spinner" style={{ display: 'inline-block', marginRight: '8px' }}>⏳</span>
            Seeding Schools...
          </>
        ) : (
          '🌱 Seed Schools Database'
        )}
      </button>
      {result && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          background: '#d4edda', 
          borderRadius: '8px',
          color: '#155724'
        }}>
          ✅ Success! Created {result.created} schools, skipped {result.skipped} duplicates.
        </div>
      )}
      {error && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          background: '#f8d7da', 
          borderRadius: '8px',
          color: '#721c24'
        }}>
          ❌ Error: {error}
        </div>
      )}
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

function HelpModal({ onClose, userEmail }) {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    email: userEmail || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/admin/help-request', formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({
            subject: '',
            category: 'general',
            message: '',
            email: userEmail || ''
          });
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.msg || 
                          err.response?.data?.error || 
                          'Failed to submit help request. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Get Help</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {submitted ? (
          <div className="modal-body">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>Request Submitted!</h3>
              <p style={{ color: 'var(--text-light)' }}>We'll get back to you soon.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            {error && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input"
                required
                placeholder="Brief description of your issue"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input"
                required
                rows={6}
                placeholder="Please provide details about your question or issue..."
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function HelpMessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get('/api/help', { params });
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Failed to fetch help messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/help/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch help stats:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/help/${id}`, { status: newStatus });
      fetchMessages();
      fetchStats();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const saveAdminNotes = async (id) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/help/${id}`, { adminNotes });
      fetchMessages();
      setSelectedMessage(null);
      setAdminNotes('');
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this help message?')) return;
    
    try {
      await axios.delete(`/api/help/${id}`);
      fetchMessages();
      fetchStats();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || '');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="help-messages-management">
      {stats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card card">
            <div className="stat-icon">📬</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Messages</div>
            </div>
          </div>
          <div className="stat-card card warning">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-value">{stats.unread}</div>
              <div className="stat-label">Unread</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <div className="stat-value">{stats.read}</div>
              <div className="stat-label">Read</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2>Help Messages</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="all">All Statuses</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No help messages found.</p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-card card ${message.status === 'UNREAD' ? 'unread' : ''}`}
              style={{
                marginBottom: '16px',
                padding: '20px',
                borderLeft: message.status === 'UNREAD' ? '4px solid var(--primary)' : '4px solid var(--border)',
                cursor: 'pointer',
              }}
              onClick={() => openMessage(message)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '4px' }}>{message.subject}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                    From: {message.name} ({message.email})
                    {message.user && <span> • User Account</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    className={`status-badge status-${message.status.toLowerCase()}`}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: message.status === 'UNREAD' ? '#fee2e2' : '#e0e7ff',
                      color: message.status === 'UNREAD' ? '#991b1b' : '#1e40af',
                    }}
                  >
                    {message.status}
                  </span>
                </div>
              </div>
              <p style={{ margin: '12px 0', color: 'var(--text)', lineHeight: '1.6' }}>
                {message.message.length > 200 ? `${message.message.substring(0, 200)}...` : message.message}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedMessage.subject}</h2>
              <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})
              {selectedMessage.user && <span> • User Account: {selectedMessage.user.email}</span>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Message:</strong>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedMessage.message}</p>
            </div>

            {selectedMessage.adminNotes && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Admin Notes:</strong>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedMessage.adminNotes}</p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Admin Notes:</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="input"
                rows={4}
                placeholder="Add notes or response..."
                maxLength={5000}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateStatus(selectedMessage.id, 'UNREAD')}
                className="btn btn-outline"
                disabled={updating || selectedMessage.status === 'UNREAD'}
                style={{ fontSize: '14px' }}
              >
                Mark Unread
              </button>
              <button
                onClick={() => updateStatus(selectedMessage.id, 'READ')}
                className="btn btn-outline"
                disabled={updating || selectedMessage.status === 'READ'}
                style={{ fontSize: '14px' }}
              >
                Mark Read
              </button>
              <button
                onClick={() => updateStatus(selectedMessage.id, 'IN_PROGRESS')}
                className="btn btn-outline"
                disabled={updating || selectedMessage.status === 'IN_PROGRESS'}
                style={{ fontSize: '14px' }}
              >
                In Progress
              </button>
              <button
                onClick={() => updateStatus(selectedMessage.id, 'RESOLVED')}
                className="btn btn-primary"
                disabled={updating || selectedMessage.status === 'RESOLVED'}
                style={{ fontSize: '14px' }}
              >
                Resolve
              </button>
              <button
                onClick={() => updateStatus(selectedMessage.id, 'ARCHIVED')}
                className="btn btn-outline"
                disabled={updating || selectedMessage.status === 'ARCHIVED'}
                style={{ fontSize: '14px' }}
              >
                Archive
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => saveAdminNotes(selectedMessage.id)}
                className="btn btn-primary"
                disabled={updating}
                style={{ flex: 1 }}
              >
                {updating ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="btn btn-secondary"
                disabled={updating}
                style={{ flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
