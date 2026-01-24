import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SchoolSearch from '../components/SchoolSearch';
import RASearchAutocomplete from '../components/RASearchAutocomplete';
import './Home.css';

function Home() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedRA, setSelectedRA] = useState(null);
  const [searchMode, setSearchMode] = useState('school'); // 'school' or 'name'
  const navigate = useNavigate();

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSelectedRA(null); // Clear RA selection when school changes
  };

  const handleRASelect = (ra) => {
    if (ra) {
      setSelectedRA(ra);
      navigate(`/ra/${ra.id}`);
    }
  };

  const handleNameSearchClick = () => {
    setSearchMode('name');
    navigate('/search');
  };

  return (
    <div className="home">
      <div className="container">
        <div className="hero">
          <h1>Rate Your Resident Assistant</h1>
          <p className="subtitle">
            Share your honest feedback and help other students by leaving reviews about your RA
          </p>
          
          <div className="search-flow">
            <div className="school-selection">
              <SchoolSearch
                onSelectSchool={handleSchoolSelect}
                selectedSchool={selectedSchool}
                placeholder="Enter your school to get started"
              />
            </div>

            {selectedSchool && (
              <div className="search-form">
                <label className="search-label">Look up an RA</label>
                <RASearchAutocomplete
                  schoolId={selectedSchool.id}
                  selectedRA={selectedRA}
                  onSelectRA={handleRASelect}
                  placeholder={`Look up an RA at ${selectedSchool.name}...`}
                />
              </div>
            )}

            <div className="alternative-search">
              <button 
                type="button" 
                className="link-button"
                onClick={handleNameSearchClick}
              >
                I'd like to look up an RA by name
              </button>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Your Voice Matters</h2>
          <p className="cta-subtitle">
            Share your honest experience and help future students know what to expect. 
            Every review makes a difference.
          </p>
          
          <div className="cta-reasons">
            <div className="reason-item">
              <div className="reason-icon">💬</div>
              <h3>Help Others</h3>
              <p>Your feedback helps students understand what to expect from their RA</p>
            </div>
            <div className="reason-item">
              <div className="reason-icon">🎯</div>
              <h3>Be Honest</h3>
              <p>Share your real experience - the good, the bad, and everything in between</p>
            </div>
            <div className="reason-item">
              <div className="reason-icon">🔒</div>
              <h3>Stay Anonymous</h3>
              <p>All reviews are completely anonymous - share freely without worry</p>
            </div>
          </div>
          
          <div className="cta-actions">
            <Link to="/add-ra" className="btn btn-primary btn-large">
              Add Your RA & Leave a Review
            </Link>
            <p className="cta-note">No account needed - start reviewing in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
