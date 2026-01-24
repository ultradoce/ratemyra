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
            Share your experience and help other students find the best RAs
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
                <label className="search-label">Search for an RA</label>
                <RASearchAutocomplete
                  schoolId={selectedSchool.id}
                  selectedRA={selectedRA}
                  onSelectRA={handleRASelect}
                  placeholder={`Search for an RA at ${selectedSchool.name}...`}
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

        <div className="join-section">
          <h2>Join the RateMyRA Family</h2>
          <p className="join-subtitle">Love RateMyRA? Let's make it official.</p>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">✏️</div>
              <h3>Manage and edit your ratings</h3>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Your ratings are always anonymous</h3>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👍</div>
              <h3>Like or dislike ratings</h3>
            </div>
          </div>
          
          <div className="join-cta">
            <Link to="/login" className="btn btn-primary btn-large">
              Sign up now!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
