import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SchoolSearch from '../components/SchoolSearch';
import './Home.css';

function Home() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSearchQuery(''); // Clear RA search when school changes
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedSchool) {
      return; // Can't search without a school
    }
    if (searchQuery.trim()) {
      navigate(`/search?schoolId=${selectedSchool.id}&q=${encodeURIComponent(searchQuery.trim())}`);
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
              <form onSubmit={handleSearch} className="search-form">
                <label className="search-label">Step 2: Search for an RA</label>
                <div className="ra-search-wrapper">
                  <input
                    type="text"
                    placeholder={`Search for an RA at ${selectedSchool.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="btn btn-primary" disabled={!searchQuery.trim()}>
                    Search
                  </button>
                </div>
              </form>
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
