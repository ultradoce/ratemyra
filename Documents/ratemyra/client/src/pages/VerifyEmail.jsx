import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './VerifyEmail.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to verify email. The link may be invalid or expired.');
    }
  };

  const handleResend = async () => {
    // This would need the user's email, but we don't have it from the token
    // For now, redirect to login with a message
    navigate('/login?resend=true');
  };

  return (
    <div className="verify-email-page">
      <div className="container">
        <div className="verify-card card">
          {status === 'verifying' && (
            <>
              <div className="verify-icon">📧</div>
              <h1>Verifying Your Email</h1>
              <p>Please wait while we verify your email address...</p>
              <LoadingSpinner size="medium" />
            </>
          )}

          {status === 'success' && (
            <>
              <div className="verify-icon success">✅</div>
              <h1>Email Verified!</h1>
              <p>{message}</p>
              <p className="redirect-message">Redirecting to login...</p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="verify-icon error">❌</div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
              <div className="verify-actions">
                <Link to="/login" className="btn btn-primary">
                  Go to Login
                </Link>
                <button onClick={handleResend} className="btn btn-outline">
                  Resend Verification Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
