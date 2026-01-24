import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SchoolSearch from '../components/SchoolSearch';
import RASearchAutocomplete from '../components/RASearchAutocomplete';
import './Home.css';

function Home() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedRA, setSelectedRA] = useState(null);
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
              <label className="search-label">Step 1: Find Your School</label>
              <SchoolSearch
                onSelectSchool={handleSchoolSelect}
                selectedSchool={selectedSchool}
                placeholder="Enter your school to get started"
              />
            </div>

            {selectedSchool && (
              <div className="search-form">
                <label className="search-label">Step 2: Search for an RA</label>
                <RASearchAutocomplete
                  schoolId={selectedSchool.id}
                  selectedRA={selectedRA}
                  onSelectRA={handleRASelect}
                  placeholder={`Search for an RA at ${selectedSchool.name}...`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>🔍 Find RAs</h3>
            <p>Search for resident assistants at your school</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Rate & Review</h3>
            <p>Share your experience with helpful reviews</p>
          </div>
          <div className="feature-card">
            <h3>📊 See Stats</h3>
            <p>View ratings, difficulty, and helpful tags</p>
          </div>
          <div className="feature-card">
            <h3>➕ Add RAs</h3>
            <p>Help grow the database by adding new RAs</p>
          </div>
        </div>

        <div className="cta-section">
          <Link to="/add-ra" className="btn btn-primary btn-large">
            Add a New RA
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
