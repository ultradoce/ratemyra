import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (searchParams.get('resend') === 'true') {
      setShowResendVerification(true);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = isLogin
      ? await login(formData.email, formData.password)
      : await register(formData.email, formData.password);

    if (result.success) {
      // Check if email is verified
      if (!result.user?.emailVerified && result.user?.role !== 'ADMIN') {
        setSuccessMessage('Account created! Please check your email to verify your account before logging in.');
        setIsLogin(true);
        setShowResendVerification(true);
        setFormData({ email: formData.email, password: '' });
        return;
      }

      // Check if user is admin, redirect accordingly
      const userRole = result.user?.role;
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        // Regular users go to home page
        navigate('/');
      }
    } else {
      setError(result.error);
      // If email not verified, show resend option
      if (result.error?.includes('verify your email') || result.emailVerified === false) {
        setShowResendVerification(true);
      }
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await axios.post('/api/auth/resend-verification', { email: formData.email });
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setShowResendVerification(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <h1>{isLogin ? 'Login' : 'Create Account'}</h1>
          <p className="login-subtitle">
            {isLogin
              ? 'Sign in to your account'
              : 'Create an account to write reviews and add RAs'}
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {successMessage && (
            <div className="success-message" style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #c3e6cb'
            }}>
              {successMessage}
            </div>
          )}

          {showResendVerification && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>Your email is not verified.</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>


          <div className="login-switch">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="link-button"
            >
              {isLogin
                ? "Don't have an account? Create one"
                : 'Already have an account? Login'}
            </button>
          </div>

          <div className="login-footer">
            <Link to="/" className="link-button">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
