import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for an RA by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
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
