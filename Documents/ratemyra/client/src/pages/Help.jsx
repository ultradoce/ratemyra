import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Help.css';

function Help() {
  return (
    <div className="help-page">
      <div className="container">
        <div className="content-card">
          <h1>Help & Support</h1>
          
          <section>
            <h2>Getting Started</h2>
            <p>Welcome to RateMyRA! Here's how to get started:</p>
            <ol>
              <li><strong>Search for a School:</strong> Start by selecting your college or university from the search box on the homepage.</li>
              <li><strong>Look Up an RA:</strong> Once you've selected a school, search for your Resident Assistant by name.</li>
              <li><strong>Read Reviews:</strong> View honest ratings and reviews from other students who have had the same RA.</li>
              <li><strong>Add an RA:</strong> If your RA isn't listed yet, you can add their profile to the database.</li>
              <li><strong>Write a Review:</strong> Share your honest feedback by writing a review about your experience with the RA.</li>
            </ol>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I look up an RA?</h3>
              <p>First, select your school from the dropdown. Then, type your RA's name in the search box. You can search by first name, last name, or both.</p>
            </div>

            <div className="faq-item">
              <h3>Can I add an RA that's not listed?</h3>
              <p>Yes! Click on "Add RA" in the navigation menu, select your school, and fill in the RA's information.</p>
            </div>

            <div className="faq-item">
              <h3>How do I write a review?</h3>
              <p>Navigate to an RA's profile page and click "Write a Review". You'll need to be logged in to submit a review.</p>
            </div>

            <div className="faq-item">
              <h3>What should I include in my review?</h3>
              <p>Be honest and constructive. Include information about the RA's helpfulness, approachability, responsiveness, and overall experience. Avoid personal attacks or inappropriate content.</p>
            </div>

            <div className="faq-item">
              <h3>Can I edit or delete my review?</h3>
              <p>Currently, reviews cannot be edited or deleted after submission. Please review your content carefully before submitting.</p>
            </div>

            <div className="faq-item">
              <h3>How are ratings calculated?</h3>
              <p>Ratings are calculated as the average of all submitted reviews for that RA. Each review includes ratings for helpfulness, approachability, and overall experience.</p>
            </div>
          </section>

          <section>
            <h2>Contact Support</h2>
            <p>If you need additional help or have questions not covered here, please refer to our <a href="/guidelines">Site Guidelines</a> or fill out the form below to contact our support team.</p>
            
            <HelpContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}

function HelpContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.email.split('@')[0] || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/help', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit help request. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="help-form-container" style={{ marginTop: '32px', padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Send us a Message</h3>
      
      {success && (
        <div className="success-message" style={{ 
          padding: '12px 16px', 
          background: '#d4edda', 
          color: '#155724', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          ✓ Your message has been sent! We'll get back to you soon.
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          padding: '12px 16px', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>
            Your Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            maxLength={100}
            className="input"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>
            Your Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="input"
            placeholder="your.email@example.com"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required
            maxLength={200}
            className="input"
            placeholder="What is this about?"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            className="input"
            placeholder="Tell us how we can help you..."
          />
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', textAlign: 'right' }}>
            {formData.message.length}/2000 characters
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%' }}
        >
          {submitting ? (
            <>
              <span className="loading-spinner"></span>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}

export default Help;
